import { useState } from "react";
import { useQueues } from "./use-queues";
import { ManageJudgesPerQuestionInQueue } from "./display-questions-in-queue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useJudgesInQueue } from "./use-judges";

export function ContainerAssignJudges() {
  const { data: queues, isLoading, error } = useQueues();
  const [selectedQueue, setSelectedQueue] = useState<string>("");

  const {
    data: judges,
    isLoading: isLoadingJudges,
    error: errorJudges,
  } = useJudgesInQueue(selectedQueue);

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading queues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-destructive">
          Error loading queues:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!queues || queues.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          No queues found. Upload submissions to create queues.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="queue-select">Select Queue</Label>
        <Select value={selectedQueue} onValueChange={setSelectedQueue}>
          <SelectTrigger id="queue-select" className="w-full">
            <SelectValue placeholder="Choose a queue" />
          </SelectTrigger>
          <SelectContent>
            {queues.map((queueId) => (
              <SelectItem key={queueId} value={queueId}>
                {queueId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedQueue && (
        <ManageJudgesPerQuestionInQueue queueId={selectedQueue} />
      )}
    </div>
  );
}
