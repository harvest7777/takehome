import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { LLMModel } from "@/lib/global";

export function CreateAgentButton() {
  const handleCreateAgent = async () => {
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
      alert("Agent created successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    }
  };

  return (
    <Button onClick={handleCreateAgent}>
      <Plus />
      Create Agent
    </Button>
  );
}
