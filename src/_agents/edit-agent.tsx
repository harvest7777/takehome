import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";

const llmModels: LLMModel[] = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1",
  "gpt-4.1-mini",
];

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  model: z.enum(["gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini"] as const, {
    message: "Please select a model.",
  }),
  is_active: z.boolean(),
  rubric: z.string().min(1, {
    message: "Rubric is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditAgentButtonProps {
  agent: Agent;
}

async function updateAgent(id: number, values: FormValues): Promise<Agent> {
  const { data, error } = await supabase
    .from("agent_configurations")
    .update({
      name: values.name,
      model: values.model,
      is_active: values.is_active,
      rubric: values.rubric,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update agent: ${error.message}`);
  }

  return data;
}

export function EditAgentButton({ agent }: EditAgentButtonProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: agent.name,
      model: agent.model,
      is_active: agent.is_active,
      rubric: agent.rubric,
    },
  });

  // Reset form when agent changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: agent.name,
        model: agent.model,
        is_active: agent.is_active,
        rubric: agent.rubric,
      });
    }
  }, [agent, open, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateAgent(agent.id, values),
    onMutate: async (newValues) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["agents"] });

      // Snapshot the previous value
      const previousAgents = queryClient.getQueryData<Agent[]>(["agents"]);

      // Optimistically update to the new value
      if (previousAgents) {
        queryClient.setQueryData<Agent[]>(["agents"], (old) => {
          if (!old) return old;
          return old.map((a) =>
            a.id === agent.id
              ? {
                  ...a,
                  ...newValues,
                }
              : a
          );
        });
      }

      return { previousAgents };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAgents) {
        queryClient.setQueryData(["agents"], context.previousAgents);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Update the AI agent configuration.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormDescription>
                    A descriptive name for this agent.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="My Agent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormDescription>
                    The LLM model to use for this agent.
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {llmModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Whether this agent is currently active.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rubric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rubric</FormLabel>
                  <FormDescription>
                    The evaluation rubric for this agent.
                  </FormDescription>
                  <FormControl>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 resize-none"
                      placeholder="Enter the evaluation rubric..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Updating..." : "Update Agent"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
