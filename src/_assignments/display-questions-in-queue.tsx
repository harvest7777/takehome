import { QuestionCard } from "./question-card";
import { useQuestionsInQueue } from "./use-questions-in-queue";

interface DisplayQuestionsInQueueProps {
  queueId: string | null;
}

export function DisplayQuestionsInQueue({
  queueId,
}: DisplayQuestionsInQueueProps) {
  const { data: questions, isLoading, error } = useQuestionsInQueue(queueId);

  if (!queueId) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          Please select a queue to view questions.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-destructive">
          Error loading questions:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          No questions found in this queue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Questions ({questions.length})
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questions.map((question) => (
          <QuestionCard
            key={`${question.submission_id}-${question.question_id}`}
            question={question}
          />
        ))}
      </div>
    </div>
  );
}
