import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

/**
 * Create a new judge
 */
async function createJudge(newJudge: Agent): Promise<Agent> {
  const { data, error } = await supabase
    .from("agent_configurations")
    .insert(newJudge)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create judge: ${error.message}`);
  }

  return data;
}

export function useCreateJudge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJudge,
    onMutate: async (newJudge) => {
      await queryClient.cancelQueries({ queryKey: ["judges"] });

      const previousJudges = queryClient.getQueryData<Agent[]>(["judges"]);

      queryClient.setQueryData<Agent[]>(["judges"], (old) => {
        if (!old) return old;
        return [newJudge, ...old];
      });

      return { previousJudges, newJudge };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousJudges) {
        queryClient.setQueryData(["judges"], context.previousJudges);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["judges"] });
    },
  });
}

/**
 * Update an existing judge
 */
async function updateJudge(
  id: string,
  values: {
    name: string;
    model: LLMModel;
    is_active: boolean;
    rubric: string;
  }
): Promise<Agent> {
  const { data, error } = await supabase
    .from("agent_configurations")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update judge: ${error.message}`);
  }

  return data;
}

export function useUpdateJudge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Parameters<typeof updateJudge>[1];
    }) => updateJudge(id, values),
    onMutate: async ({ id, values: newValues }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["judges"] });

      // Snapshot the previous value
      const previousJudges = queryClient.getQueryData<Agent[]>(["judges"]);

      // Optimistically update to the new value
      if (previousJudges) {
        queryClient.setQueryData<Agent[]>(["judges"], (old) => {
          if (!old) return old;
          return old.map((j) =>
            j.id === id
              ? {
                  ...j,
                  ...newValues,
                }
              : j
          );
        });
      }

      return { previousJudges };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJudges) {
        queryClient.setQueryData(["judges"], context.previousJudges);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["judges"] });
    },
  });
}

/**
 * Delete a judge
 */
async function deleteJudge(id: string): Promise<void> {
  const { error } = await supabase
    .from("agent_configurations")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete judge: ${error.message}`);
  }
}

export function useDeleteJudge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJudge,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["judges"] });

      // Snapshot the previous value
      const previousJudges = queryClient.getQueryData<Agent[]>(["judges"]);

      // Optimistically remove the judge
      if (previousJudges) {
        queryClient.setQueryData<Agent[]>(["judges"], (old) => {
          if (!old) return old;
          return old.filter((j) => j.id !== id);
        });
      }

      return { previousJudges };
    },
    onError: (_err, _id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJudges) {
        queryClient.setQueryData(["judges"], context.previousJudges);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["judges"] });
    },
  });
}