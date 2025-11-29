import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Fetch judges assigned to a specific queue 
 */
type ExtendedJudge = StoredJudge & {
    name: string;
}
async function fetchJudgesInQueue(
  queueId: string,
): Promise<ExtendedJudge[]> {
  // Fetch question_judges and join with agent_configurations to get judge names
const { data: judges, error } = await supabase.rpc('get_question_judges_by_queue', { queue_id_input: queueId })

  if (error) {
    throw new Error(`Failed to fetch judges: ${error.message}`);
  }

  if (!judges || judges.length === 0) {
    return [];
  }

  return judges;
}

/**
 * Hook to fetch judges for a specific question
 */
export function useJudgesInQueue(
    queueId: string,
) {
  return useQuery({
    queryKey: ["extended_judges_for_queue", queueId
    ],
    queryFn: () => fetchJudgesInQueue(queueId),
    enabled: !!queueId,
  });
}

export function useDeleteJudgeFromQuestion(judgeId: string, questionId: string, queueId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteJudgeFromQuestion(judgeId, questionId),
    // Cancel any outgoing refetches
    // (so they don't overwrite our optimistic update)
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['extended_judges_for_queue', queueId] })
      const previousJudges = queryClient.getQueryData(['extended_judges_for_queue', queueId])
      queryClient.setQueryData(['extended_judges_for_queue', queueId], (old: ExtendedJudge[]) => old.filter((judge) => judge.id !== judgeId))
      return { previousJudges }
    },
    onError: (err, variables, context) => {
      if (context?.previousJudges) {
        queryClient.setQueryData(['extended_judges_for_queue', queueId], context.previousJudges)
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['extended_judges_for_queue', queueId] })
    },
  });
}

export function useAssignJudgeToQuestion(extendedJudge: ExtendedJudge) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => assignJudgeToQuestion(extendedJudge),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['extended_judges_for_queue', extendedJudge.queue_id] })
      const previousJudges = queryClient.getQueryData(['extended_judges_for_queue', extendedJudge.queue_id])
      queryClient.setQueryData(['extended_judges_for_queue', extendedJudge.queue_id], (old: ExtendedJudge[]) => [...old, extendedJudge])
      return { previousJudges }
    },
    onError: (err, variables, context) => {
      if (context?.previousJudges) {
        queryClient.setQueryData(['extended_judges_for_queue', extendedJudge.queue_id], context.previousJudges)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['extended_judges_for_queue', extendedJudge.queue_id] })
    },
  });
}

async function deleteJudgeFromQuestion(judgeId: string, questionId: string): Promise<void> {
  const { error } = await supabase.from("question_judges").delete().eq("judge_id", judgeId).eq("question_id", questionId);
  if (error) {
    throw new Error(`Failed to delete judge: ${error.message}`);
  }
}

async function assignJudgeToQuestion(extendedJudge: ExtendedJudge): Promise<void> {
  const { error } = await supabase.from("question_judges").insert({ judge_id: extendedJudge.id, question_id: extendedJudge.question_id, queue_id: extendedJudge.queue_id });
  if (error) {
    throw new Error(`Failed to assign judge: ${error.message}`);
  }
}