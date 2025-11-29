import { cn } from "@/lib/utils";
import { useJudges } from "./use-judges";

interface QuestionCardProps {
  questionText: string;
  questionType: string;
  judgeIds: string[];
  className?: string;
}

export function QuestionCard({
  questionText,
  questionType,
  judgeIds,
  className,
}: QuestionCardProps) {
  const { data: judgesData } = useJudges();
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-base">{questionText}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2 capitalize">
            {questionType.replace(/_/g, " ")}
          </p>
          {judgeIds.map((judgeId) => (
            <div
              key={judgeId}
              className="text-xs text-muted-foreground capitalize"
            >
              {judgesData?.find((judge) => judge.id === judgeId)?.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
