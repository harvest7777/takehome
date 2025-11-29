import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Json } from "@/lib/database.types";

type QuestionFromQueue = {
  created_at: string;
  question_data: Json;
  surrogate_question_id: string;
  surrogate_submission_id: string | null;
};

async function fetchQuestionsInQueue(
  queueId: string
): Promise<QuestionFromQueue[]> {
  // This will return all questions from a given queue
  const { data, error } = await supabase.rpc("get_questions_by_queue", {
    queue_id_input: queueId,
  });

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return (data || []) as QuestionFromQueue[];
}

export function useQuestionsInQueue(queueId: string | null) {
  return useQuery({
    queryKey: ["questions", "queue", queueId],
    queryFn: () => fetchQuestionsInQueue(queueId!),
    enabled: !!queueId, // Only fetch when queueId is provided
  });
}

