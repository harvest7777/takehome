import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Fetch judges assigned to a specific question
 */
async function fetchJudgesForQuestion(
  questionId: string,
  submissionId: string
): Promise<Agent[]> {
  // Fetch question_judges and join with agent_configurations to get judge names
  const { data: questionJudges, error } = await supabase
    .from("question_judges")
    .select("judge_id, agent_configurations!question_judges_judge_id_fkey(*)")
    .eq("question_id", questionId)
    .eq("submission_id", submissionId);

  if (error) {
    throw new Error(`Failed to fetch judges: ${error.message}`);
  }

  if (!questionJudges || questionJudges.length === 0) {
    return [];
  }

  // Extract agent configurations from the joined data
  const judges = questionJudges
    .map((qj) => {
      const agent = (qj as { agent_configurations: Agent }).agent_configurations;
      return agent;
    })
    .filter((agent): agent is Agent => agent !== null && agent !== undefined);

  return judges;
}

/**
 * Hook to fetch judges for a specific question
 */
export function useJudgesForQuestion(
  questionId: string | null,
  submissionId: string | null
) {
  return useQuery({
    queryKey: ["question_judges", questionId, submissionId],
    queryFn: () => fetchJudgesForQuestion(questionId!, submissionId!),
    enabled: questionId !== null && submissionId !== null,
  });
}

/**
 * Assign a judge to a question by inserting into question_judges table
 */
async function assignJudgeToQuestion(
  questionId: string,
  submissionId: string,
  judgeId: string | null
): Promise<void> {
  if (judgeId === null) {
    // Remove all judge assignments for this question
    const { error } = await supabase
      .from("question_judges")
      .delete()
      .eq("question_id", questionId)
      .eq("submission_id", submissionId);

    if (error) {
      throw new Error(`Failed to remove judge assignment: ${error.message}`);
    }
    return;
  }

  // Check if assignment already exists
  const { data: existing } = await supabase
    .from("question_judges")
    .select("id")
    .eq("question_id", questionId)
    .eq("submission_id", submissionId)
    .eq("judge_id", judgeId)
    .single();

  if (existing) {
    // Already exists, no need to insert
    return;
  }

  // Insert new assignment
  const { error } = await supabase.from("question_judges").insert({
    question_id: questionId,
    submission_id: submissionId,
    judge_id: judgeId,
  });

  if (error) {
    throw new Error(`Failed to assign judge: ${error.message}`);
  }
}

/**
 * Hook to assign/unassign a judge to a question
 */
export function useAssignJudgeToQuestion(queueId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      submissionId,
      judgeId,
    }: {
      questionId: string;
      submissionId: string;
      judgeId: string | null;
    }) => assignJudgeToQuestion(questionId, submissionId, judgeId),
    onMutate: async ({ questionId, submissionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["questions", "queue", queueId],
      });
      await queryClient.cancelQueries({
        queryKey: ["question_judges", questionId, submissionId],
      });

      // Snapshot the previous questions
      const previousQuestions = queryClient.getQueryData<StoredQuestion[]>([
        "questions",
        "queue",
        queueId,
      ]);

      return { previousQuestions };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousQuestions) {
        queryClient.setQueryData(
          ["questions", "queue", queueId],
          context.previousQuestions
        );
      }
    },
    onSettled: (_data, _error, { questionId, submissionId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["questions", "queue", queueId],
      });
      queryClient.invalidateQueries({
        queryKey: ["question_judges", questionId, submissionId],
      });
    },
  });
}

