import { runAthena } from "../council/athena.js";
import { runHermes } from "../council/hermes.js";
import { runApollo } from "../council/apollo.js";
import { runThemis } from "../council/themis.js";
import { runAres } from "../council/ares.js";
import { runHephaestus } from "../council/hephaestus.js";
import { runZeus } from "../council/zeus.js";
import { reviewStage } from "../council/argus.js";
import { config } from "../config.js";
import { SessionStore } from "../memory/sessionStore.js";
import { EventStore } from "../memory/eventStore.js";
import { ALL_STAGES, type ArgusVerdict, type ProjectMemory, type StageName } from "../memory/types.js";

type StageOutcome =
  | { outcome: "APPROVED"; approvedOutput: unknown }
  | { outcome: "ESCALATED"; reason: string };

const STAGE_RUNNERS: Record<StageName, (args: { founderInput: ProjectMemory["founderInput"]; memory: ProjectMemory; revision: { previousOutput: unknown; verdict: ArgusVerdict } | null }) => Promise<unknown>> = {
  athena: runAthena,
  hermes: runHermes,
  apollo: runApollo,
  themis: runThemis,
  ares: runAres,
  hephaestus: runHephaestus,
  zeus: runZeus,
};

async function runStageWithReview(
  sessionId: string,
  stage: StageName,
  memory: ProjectMemory,
  eventStore: EventStore
): Promise<StageOutcome> {
  let revision: { previousOutput: unknown; verdict: ArgusVerdict } | null = null;

  for (let attempt = 1; attempt <= config.maxRevisionAttempts; attempt++) {
    const output = await STAGE_RUNNERS[stage]({ founderInput: memory.founderInput, memory, revision });
    const verdict = await reviewStage(stage, memory, output);
    eventStore.record(sessionId, stage, attempt, output, verdict);

    if (verdict.score >= 80) {
      return { outcome: "APPROVED", approvedOutput: output };
    }

    if (verdict.decision === "ESCALATE" || attempt === config.maxRevisionAttempts) {
      return {
        outcome: "ESCALATED",
        reason: `Stage ${stage} failed to reach approval after ${attempt} attempt(s). Best score: ${verdict.score}/100. Weaknesses: ${verdict.weaknesses.join("; ")}`,
      };
    }

    revision = { previousOutput: output, verdict };
  }

  return { outcome: "ESCALATED", reason: `Stage ${stage} exhausted revision attempts.` };
}

export async function runSession(
  sessionId: string,
  sessionStore: SessionStore,
  eventStore: EventStore
): Promise<void> {
  sessionStore.updateStatus(sessionId, "working");
  let memory = sessionStore.getMemory(sessionId);

  for (const stage of ALL_STAGES) {
    sessionStore.setCurrentStage(sessionId, stage);
    const result = await runStageWithReview(sessionId, stage, memory, eventStore);

    if (result.outcome === "ESCALATED") {
      memory.status = "escalated";
      sessionStore.saveMemory(sessionId, memory, stage);
      sessionStore.updateStatus(sessionId, "failed", result.reason);
      return;
    }

    memory = { ...memory, [stage]: result.approvedOutput };
    sessionStore.saveMemory(sessionId, memory, stage);
  }

  memory.status = "completed";
  sessionStore.saveMemory(sessionId, memory, "done");
  sessionStore.updateStatus(sessionId, "completed");
}
