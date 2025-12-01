import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useJudges } from "@/_assignments/use-judges";

interface StartJudgingButtonProps {
  currentQueueId: string;
}

export function StartJudgingButton({
  currentQueueId,
}: StartJudgingButtonProps) {
  const { data: judges } = useJudges();

  const judge = async () => {
    if (!judges) {
      console.error(
        "Something seriously went wrong. No way you have no judges but have judges assigned to questions"
      );
      return;
    }
    // find the next unjudged questions then send them all off for judging
    const { data: firstBatch } = await supabase.rpc("get_next_judges", {
      n: 3,
      input_queue: currentQueueId,
    });

    firstBatch?.forEach(async (judgeQuestion) => {
      const judge: StoredJudge | undefined = judges.find(
        (x) => x.id == judgeQuestion.judge_id
      );
      if (!judge) {
        console.error(
          "Something went wrong again... you are assigning a non existent judge to a question"
        );
        return;
      }
      const { data, error } = await supabase.from("question_results").insert({
        surrogate_question_id: judgeQuestion.surrogate_question_id,
        historical_model: judge.model,
        historical_rubric_used: judge.rubric,
        reference_judge_id: judge.id,
      });
    });
  };
  return <Button onClick={judge}>Start Judging</Button>;
}
