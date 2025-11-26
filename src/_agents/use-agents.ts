import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agent_configurations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  return data;
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });
}

async function createAgent(values: {
  name: string;
  model: LLMModel;
  is_active: boolean;
  rubric: string;
}): Promise<Agent> {
  const { data, error } = await supabase
    .from("agent_configurations")
    .insert(values)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create agent: ${error.message}`);
  }

  return data;
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

async function updateAgent(
  id: number,
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
    throw new Error(`Failed to update agent: ${error.message}`);
  }

  return data;
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: Parameters<typeof updateAgent>[1] }) =>
      updateAgent(id, values),
    onMutate: async ({ id, values: newValues }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["agents"] });

      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(["agents"]);

      // Optimistically update to the new value
      if (previousAgents) {
        queryClient.setQueryData<Agent[]>(["agents"], (old) => {
          if (!old) return old;
          return old.map((a) =>
            a.id === id
              ? {
                  ...a,
                  ...newValues,
                }
              : a
          );
        });
      }

      return { previousAgents };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAgents) {
        queryClient.setQueryData(["agents"], context.previousAgents);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

async function deleteAgent(id: number): Promise<void> {
  const { error } = await supabase
    .from("agent_configurations")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete agent: ${error.message}`);
  }
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAgent,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["agents"] });

      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(["agents"]);

      // Optimistically remove the agent
      if (previousAgents) {
        queryClient.setQueryData<Agent[]>(["agents"], (old) => {
          if (!old) return old;
          return old.filter((a) => a.id !== id);
        });
      }

      return { previousAgents };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAgents) {
        queryClient.setQueryData(["agents"], context.previousAgents);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

