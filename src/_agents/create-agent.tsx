import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export function CreateAgentButton() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAgent = async () => {
    setIsSubmitting(true);
    try {
      const newAgent = {
        name: "New Agent",
        is_active: true,
        model: "gpt-4o-mini" as LLMModel,
        rubric: "",
      };

      const { data, error } = await supabase
        .from("agent_configurations")
        .insert(newAgent)
        .select()
        .single();

      if (error) {
        console.error("Error creating agent:", error);
        alert(`Failed to create agent: ${error.message}`);
        return;
      }

      console.log("Agent created successfully:", data);
      setOpen(false);
      alert("Agent created successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Add a new AI agent configuration to your system.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This will create a new agent with default settings. You can
            customize it later.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateAgent} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
