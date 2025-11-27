import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

async function fetchQueues(): Promise<string[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("queue_id")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch queues: ${error.message}`);
  }

  // Get unique queue_ids
  const uniqueQueues = Array.from(new Set(data.map((submission) => submission.queue_id)));
  
  return uniqueQueues;
}

export function useQueues() {
  return useQuery({
    queryKey: ["queues"],
    queryFn: fetchQueues,
  });
}

