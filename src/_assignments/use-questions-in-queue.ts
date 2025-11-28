import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

async function fetchQuestionsInQueue(queueId: string): Promise<StoredQuestion[]> {
  // First, get all submission IDs for this queue
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("id")
    .eq("queue_id", queueId);

  if (submissionsError) {
    throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
  }

  if (!submissions || submissions.length === 0) {
    return [];
  }

  const submissionIds = submissions.map((s) => s.id);

  // Then, get all questions for these submissions
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .in("submission_id", submissionIds)
    .order("created_at", { ascending: true });

  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  return questions || [];
}

export function useQuestionsInQueue(queueId: string | null) {
  return useQuery({
    queryKey: ["questions", "queue", queueId],
    queryFn: () => fetchQuestionsInQueue(queueId!),
    enabled: !!queueId, // Only fetch when queueId is provided
  });
}

async function assignJudgeToQuestion(
  questionId: string,
  submissionId: string,
  judgeId: string | null
): Promise<void> {

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
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["questions", "queue", queueId],
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
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["questions", "queue", queueId],
      });
    },
  });
}

