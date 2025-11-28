import { useState } from "react";
import { QuestionCard } from "./question-card";
import {
  useAssignJudgeToQuestion,
  useQuestionsInQueue,
} from "./use-questions-in-queue";
import { useAgents } from "@/_agents/use-agents";
import { AgentCard } from "@/_agents/agent-card";
import { cn } from "@/lib/utils";

interface ManageJudgesPerQuestionInQueueProps {
  queueId: string | null;
}

export function ManageJudgesPerQuestionInQueue({
  queueId,
}: ManageJudgesPerQuestionInQueueProps) {
  const [selectedJudgeId, setSelectedJudgeId] = useState<string | null>(null);
  const { data: questions, isLoading, error } = useQuestionsInQueue(queueId);
  const { data: judges } = useAgents();
  const { mutate: assignJudgeToQuestion } = useAssignJudgeToQuestion(queueId);

  const handleJudgeClick = (judgeId: string) => {
    if (selectedJudgeId === judgeId) {
      // Deselect if clicking the same judge
      setSelectedJudgeId(null);
    } else {
      // Select the clicked judge
      setSelectedJudgeId(judgeId);
    }
  };

  const handleQuestionClick = (question: StoredQuestion) => {
    if (question.assigned_judge_id === selectedJudgeId) {
      assignJudgeToQuestion({
        questionId: question.question_id,
        submissionId: question.submission_id,
        judgeId: null,
      });
    } else {
      assignJudgeToQuestion({
        questionId: question.question_id,
        submissionId: question.submission_id,
        judgeId: selectedJudgeId,
      });
    }
  };
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
      {/* List the judges */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {judges?.map((judge) => (
          <div
            key={judge.id}
            onClick={() => handleJudgeClick(judge.id)}
            className={cn(
              "cursor-pointer transition-all duration-200 rounded-lg",
              selectedJudgeId === judge.id
                ? "ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/30"
                : ""
            )}
          >
            <AgentCard agent={judge} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Questions ({questions.length})
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questions.map((question) => (
          <div
            key={`${question.submission_id}-${question.question_id}`}
            onClick={() => handleQuestionClick(question)}
          >
            <QuestionCard question={question} />
          </div>
        ))}
      </div>
    </div>
  );
}
