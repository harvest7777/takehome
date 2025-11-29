import { AgentCard } from "./agent-card";
import { useJudges } from "../_assignments/use-judges";

interface ViewAgentsProps {
  className?: string;
}

export function ViewAgents({ className }: ViewAgentsProps) {
  const { data: judges, isLoading, error } = useJudges();

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

  if (!judges || judges.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No judges found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {judges.map((judge) => (
          <AgentCard key={judge.id} agent={judge} />
        ))}
      </div>
    </div>
  );
}
