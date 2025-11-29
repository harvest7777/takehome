import { useState } from "react";
import { useQuestionsInQueue } from "./use-questions-in-queue";
import { useJudges } from "./use-judges";
import { AgentCard } from "@/_agents/agent-card";
import { cn } from "@/lib/utils";
import {
  useAddJudgeIdToQuestion,
  useQuestionJudgeIdsByQueue,
  useRemoveJudgeIdFromQuestion,
} from "./use-question-judges";
import { QuestionCard } from "./question-card";
import type { Json } from "@/lib/database.types";

type QuestionFromQueue = {
  created_at: string;
  question_data: Json;
  surrogate_question_id: string;
  surrogate_submission_id: string | null;
};

interface ManageJudgesPerQuestionInQueueProps {
  queueId: string | null;
}

export function ManageJudgesPerQuestionInQueue({
  queueId,
}: ManageJudgesPerQuestionInQueueProps) {
  const [selectedJudgeId, setSelectedJudgeId] = useState<string | null>(null);

  // We should grab all the questions in this queue.
  const { data: questions } = useQuestionsInQueue(queueId);

  // We should also grab all the potential judges we can assign to these questions.
  const { data: judges } = useJudges();
  const { data: questionJudgeIds } = useQuestionJudgeIdsByQueue(queueId);

  const addJudgeToQuestion = useAddJudgeIdToQuestion(queueId);
  const removeJudgeFromQuestion = useRemoveJudgeIdFromQuestion(queueId);

  // Get the mutation function from the hook
  // We'll use this when we want to edit the judges assigned for a question.
  const handleJudgeClick = (judgeId: string) => {
    if (selectedJudgeId === judgeId) {
      // Deselect if clicking the same judge
      setSelectedJudgeId(null);
    } else {
      // Select the clicked judge
      setSelectedJudgeId(judgeId);
    }
  };

  const handleQuestionClick = (question: QuestionFromQueue) => {
    if (!selectedJudgeId) return;

    if (
      questionJudgeIds?.[question.surrogate_question_id]?.includes(
        selectedJudgeId
      )
    ) {
      // If the question already has the selected judge, remove it
      removeJudgeFromQuestion.mutate({
        surrogateQuestionId: question.surrogate_question_id,
        judgeId: selectedJudgeId,
      });
    } else {
      addJudgeToQuestion.mutate({
        surrogateQuestionId: question.surrogate_question_id,
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questions?.map((question) => {
          // question_data is JSONB, so it's already parsed as an object
          // Handle both string and object cases for safety
          const questionData =
            typeof question.question_data === "string"
              ? JSON.parse(question.question_data)
              : question.question_data;

          const questionText =
            (questionData as { questionText?: string })?.questionText ||
            "No question text";
          const questionType =
            (questionData as { questionType?: string })?.questionType ||
            "Unknown type";

          return (
            <div
              key={question.surrogate_question_id}
              onClick={() => handleQuestionClick(question)}
              className="cursor-pointer"
            >
              <QuestionCard
                questionText={questionText}
                questionType={questionType}
                judgeIds={
                  questionJudgeIds?.[question.surrogate_question_id] || []
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
