import { cn } from "@/lib/utils";
import { useJudgesForQuestion } from "./use-question-judges";

interface QuestionCardProps {
  question: StoredQuestion;
  className?: string;
  onClick?: () => void;
}

export function QuestionCard({ question, className }: QuestionCardProps) {
  const { data: judges, isLoading: isLoadingJudges } = useJudgesForQuestion(
    question.question_id,
    question.submission_id
  );
  // Parse the question_data JSON
  const questionData =
    typeof question.question_data === "string"
      ? JSON.parse(question.question_data)
      : question.question_data;

  const questionText = questionData?.questionText || "No question text";
  const questionType = questionData?.questionType || "Unknown type";

  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-base">{questionText}</h3>
            <div
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                getStatusColor(question.status as JudgingStatus)
              )}
            >
              {question.status}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2 capitalize">
            {questionType.replace(/_/g, " ")}
          </p>
        </div>
      </div>
      {questionData && Object.keys(questionData).length > 3 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Additional fields available
          </p>
        </div>
      )}
      {judges && judges.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Assigned judges: {judges.map((judge) => judge.name).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

// Status badge colors
const getStatusColor = (status: JudgingStatus) => {
  switch (status) {
    case "QUEUED":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "RUNNING":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "COMPLETE":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "FAILED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "CANCELED":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};
