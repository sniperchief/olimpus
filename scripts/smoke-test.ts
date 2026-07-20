import { runAthena } from "../src/council/athena.js";
import { reviewStage } from "../src/council/argus.js";
import { createInitialMemory } from "../src/memory/types.js";

const founderInput = {
  idea: "A subscription box for artisanal coffee",
  targetAudience: "home baristas",
  primaryGoal: "validate product-market fit and launch an MVP",
};

const memory = createInitialMemory(founderInput);

console.log("Calling Athena...");
const athenaOutput = await runAthena({ founderInput, memory, revision: null });
console.log("\n=== Athena output ===");
console.log(JSON.stringify(athenaOutput, null, 2));

console.log("\nCalling Argus to review it...");
const verdict = await reviewStage("athena", memory, athenaOutput);
console.log("\n=== Argus verdict ===");
console.log(JSON.stringify(verdict, null, 2));

console.log("\nSmoke test complete — if both blocks above printed valid, schema-shaped JSON with no errors, the SDK bump did not break the LLM-calling path.");
