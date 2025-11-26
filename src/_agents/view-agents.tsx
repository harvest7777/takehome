import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AgentCard } from "./agent-card";

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

interface ViewAgentsProps {
  className?: string;
}

export function ViewAgents({ className }: ViewAgentsProps) {
  const {
    data: agents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <p className="text-destructive">
            Error loading agents: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No agents found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
