import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Fetch all judges from agent_configurations table
 */
async function fetchJudges(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agent_configurations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch judges: ${error.message}`);
  }

  return data || [];
}

/**
 * Hook to fetch all judges from agent_configurations table
 */
export function useJudges() {
  return useQuery({
    queryKey: ["judges"],
    queryFn: fetchJudges,
  });
}