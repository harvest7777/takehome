import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Type for the RPC function return value
 */
type QuestionJudgeIds = {
  surrogate_question_id: string;
  judge_ids: string[];
};

/**
 * Fetch question judge IDs for a queue using RPC function
 * Returns a map of question_id -> judge_ids[]
 */
async function fetchQuestionJudgeIdsByQueue(
  queueId: string
): Promise<Record<string, string[]>> {
  const { data, error } = await supabase.rpc(
    "get_question_judge_ids_by_queue",
    {
      queue_id_input: queueId,
    }
  );

  if (error) {
    throw new Error(`Failed to fetch question judge IDs: ${error.message}`);
  }

  const questionJudgeIds = (data || []) as QuestionJudgeIds[];
  
  // Transform array into a map: question_id -> judge_ids[]
  const map: Record<string, string[]> = {};
  for (const item of questionJudgeIds) {
    map[item.surrogate_question_id] = item.judge_ids;
  }

  return map;
}

/**
 * Hook to fetch question judge IDs for a queue
 */
export function useQuestionJudgeIdsByQueue(queueId: string | null) {
  return useQuery({
    queryKey: ["question_judge_ids", "queue", queueId],
    queryFn: () => fetchQuestionJudgeIdsByQueue(queueId!),
    enabled: !!queueId,
  });
}

/**
 * Add a judge ID to a question's judge_ids array
 */
async function addJudgeIdToQuestion(
  surrogateQuestionId: string,
  judgeId: string
): Promise<void> {
  // Check if assignment already exists


  // Insert new assignment
  const { error } = await supabase.from("question_judges").insert({
    surrogate_question_id: surrogateQuestionId,
    judge_id: judgeId,
  });

  if (error) {
    throw new Error(`Failed to add judge ID: ${error.message}`);
  }
}

/**
 * Remove a judge ID from a question's judge_ids array
 */
async function removeJudgeIdFromQuestion(
  surrogateQuestionId: string,
  judgeId: string
): Promise<void> {
  // Delete the assignment
  const { error } = await supabase
    .from("question_judges")
    .delete()
    .eq("surrogate_question_id", surrogateQuestionId)
    .eq("judge_id", judgeId);

  if (error) {
    throw new Error(`Failed to remove judge ID: ${error.message}`);
  }
}

/**
 * Hook to add a judge ID to a question
 */
export function useAddJudgeIdToQuestion(queueId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      surrogateQuestionId,
      judgeId,
    }: {
      surrogateQuestionId: string;
      judgeId: string;
    }) => addJudgeIdToQuestion(surrogateQuestionId, judgeId),
    onMutate: async ({ surrogateQuestionId, judgeId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["question_judge_ids", "queue", queueId],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<Record<string, string[]>>([
        "question_judge_ids",
        "queue",
        queueId,
      ]);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<Record<string, string[]>>(
          ["question_judge_ids", "queue", queueId],
          (old) => {
            if (!old) return old;
            const currentJudgeIds = old[surrogateQuestionId] || [];
            return {
              ...old,
              [surrogateQuestionId]: currentJudgeIds.includes(judgeId)
                ? currentJudgeIds
                : [...currentJudgeIds, judgeId],
            };
          }
        );
      }

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Roll back on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["question_judge_ids", "queue", queueId],
          context.previousData
        );
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: ["question_judge_ids", "queue", queueId],
      });
    },
  });
}

/**
 * Hook to remove a judge ID from a question
 */
export function useRemoveJudgeIdFromQuestion(queueId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      surrogateQuestionId,
      judgeId,
    }: {
      surrogateQuestionId: string;
      judgeId: string;
    }) => removeJudgeIdFromQuestion(surrogateQuestionId, judgeId),
    onMutate: async ({ surrogateQuestionId, judgeId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["question_judge_ids", "queue", queueId],
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<Record<string, string[]>>([
        "question_judge_ids",
        "queue",
        queueId,
      ]);

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<Record<string, string[]>>(
          ["question_judge_ids", "queue", queueId],
          (old) => {
            if (!old) return old;
            const currentJudgeIds = old[surrogateQuestionId] || [];
            return {
              ...old,
              [surrogateQuestionId]: currentJudgeIds.filter((id) => id !== judgeId),
            };
          }
        );
      }

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Roll back on error
      if (context?.previousData) {
        queryClient.setQueryData(
          ["question_judge_ids", "queue", queueId],
          context.previousData
        );
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: ["question_judge_ids", "queue", queueId],
      });
    },
  });
}

