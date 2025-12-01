import { useEffect } from "react";
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

  useEffect(() => {
    console.log("Subscribing to question_results table updates...");
    if (!judges) {
      return;
    }

    const channel = supabase
      .channel("question-results-subscription")
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "question_results",
        },
        async (payload) => {
          if (
            payload.old.status === "FAILED" ||
            payload.old.status === "COMPLETE"
          ) {
            const { data: nextBatch } = await supabase.rpc("get_next_judges", {
              n: 1,
              input_queue: currentQueueId,
            });

            nextBatch?.forEach(async (judgeQuestion) => {
              const judge: StoredJudge | undefined = judges.find(
                (x) => x.id == judgeQuestion.judge_id
              );
              if (!judge) {
                console.error(
                  "Something went wrong again... you are assigning a non existent judge to a question"
                );
                return;
              }
              await supabase.from("question_results").insert({
                surrogate_question_id: judgeQuestion.surrogate_question_id,
                historical_model: judge.model,
                historical_rubric_used: judge.rubric,
                reference_judge_id: judge.id,
              });
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to question_results changes");
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Channel error occurred");
        } else if (status === "TIMED_OUT") {
          console.warn("⏱️ Subscription timed out");
        } else if (status === "CLOSED") {
          console.warn("🔌 Channel closed");
        }
      });

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      console.log("Unsubscribing from question_results updates...");
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [judges, currentQueueId]);

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
      await supabase.from("question_results").insert({
        surrogate_question_id: judgeQuestion.surrogate_question_id,
        historical_model: judge.model,
        historical_rubric_used: judge.rubric,
        reference_judge_id: judge.id,
      });
    });
  };

  return <Button onClick={judge}>Start Judging</Button>;
}
