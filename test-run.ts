import { runIdeaEngine } from "./src/lib/engine.functions";

async function test() {
  try {
    const result = await runIdeaEngine({ data: { sourceId: "3bfa8e6d-f5e6-4277-be4f-27a09a38195c" } });
    console.log("RESULT:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("ERROR:", e);
  }
}

test();