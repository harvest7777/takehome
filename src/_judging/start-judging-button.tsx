import { useQuestionJudgeIdsByQueue } from "@/_assignments/use-question-judges";
import { Button } from "@/components/ui/button";
interface StartJudgingButtonProps {
  currentQueueId: string;
}
export function StartJudgingButton({
  currentQueueId,
}: StartJudgingButtonProps) {
  const { data: questionJudgesForQueue } =
    useQuestionJudgeIdsByQueue(currentQueueId);
  return <Button>Start Judging</Button>;
}
