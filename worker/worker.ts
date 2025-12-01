import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file from project root
config({ path: join(__dirname, "..", ".env.local") });

const url = process.env.VITE_SUPABASE_API_URL as string;
const key = process.env.SUPABASE_SECRET_KEY as string;

if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_API_URL or SUPABASE_SECRET_KEY");
}

const supabase = createClient(url, key);

// Sleep function for random delay
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runJudge(id: number) {
  // Random delay between 2-5 seconds (2000-5000ms)
  const delayMs = Math.floor(Math.random() * 3000) + 2000;
  console.log(`Waiting ${delayMs}ms before marking question_result ${id} as COMPLETE...`);
  await sleep(delayMs);
  
  const {data, error} = await supabase
    .from("question_results")
    .update({status: "COMPLETE"})
    .eq("id", id);
  console.log(data, error);
}
async function start() {
  console.log("Worker started - listening for changes on question_results table...");

  const channel = supabase
    .channel("question-results-listener")
    .on(
      "postgres_changes",
      {
        event: "INSERT", // Listen to INSERT, UPDATE, DELETE
        schema: "public",
        table: "question_results",
      },
      (payload) => {
        const id = payload.new.id; 
        runJudge(id);
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Successfully subscribed to question_results changes");
      } else if (status === "CHANNEL_ERROR") {
        console.error("❌ Channel error occurred:", err?.message);
      } else if (status === "TIMED_OUT") {
        console.warn("⏱️ Subscription timed out");
      } else if (status === "CLOSED") {
        console.warn("🔌 Channel closed, attempting to reconnect...");
        channel.subscribe();
      }
    });
}

start().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
