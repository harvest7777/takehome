import { useState } from "react";
import { useQueues } from "./use-queues";
import { ManageJudgesPerQuestionInQueue } from "./assign-judges";
import Spinner from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ContainerAssignJudges() {
  const { data: queues, isLoading: queuesAreLoading } = useQueues();
  const [selectedQueue, setSelectedQueue] = useState<string>("");

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="queue-select">Select Queue</Label>
        <Select value={selectedQueue} onValueChange={setSelectedQueue}>
          <SelectTrigger id="queue-select" className="w-full">
            <SelectValue placeholder="Choose a queue" />
          </SelectTrigger>
          <SelectContent>
            {queuesAreLoading || !queues ? (
              <div className="p-4 w-full flex items-center align-middle justify-center">
                <Spinner />
              </div>
            ) : (
              <>
                {queues.map((queueId) => (
                  <SelectItem key={queueId} value={queueId}>
                    {queueId}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedQueue && (
        <ManageJudgesPerQuestionInQueue queueId={selectedQueue} />
      )}
    </div>
  );
}
