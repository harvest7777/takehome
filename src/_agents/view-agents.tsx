import { AgentCard } from "./agent-card";
import { useAgents } from "./use-agents";

interface ViewAgentsProps {
  className?: string;
}

export function ViewAgents({ className }: ViewAgentsProps) {
  const { data: agents, isLoading, error } = useAgents();

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
