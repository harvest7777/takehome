import { useQuery } from "@tanstack/react-query";
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

