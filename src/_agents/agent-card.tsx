import { cn } from "@/lib/utils";
import { EditAgentButton } from "./edit-agent";

interface AgentCardProps {
  agent: Agent;
  className?: string;
}

export function AgentCard({ agent, className }: AgentCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-3 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{agent.name}</h3>
            <div
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-medium shrink-0",
                agent.is_active
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              )}
            >
              {agent.is_active ? "Active" : "Inactive"}
            </div>
            <EditAgentButton agent={agent} />
          </div>
          <p className="text-xs text-muted-foreground mb-2">{agent.model}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {agent.rubric || "No rubric found"}
          </p>
        </div>
      </div>
    </div>
  );
}
