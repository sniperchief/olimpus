import { ALL_STAGES, type ProjectMemory, type StageName, type StageRunRow } from "../memory/types.js";

export interface StageMetadata {
  agent: StageName;
  attempts: number;
  finalArgusScore: number | null;
  finalArgusDecision: string | null;
}

export interface StartupWorkspace {
  athena: ProjectMemory["athena"];
  hermes: ProjectMemory["hermes"];
  apollo: ProjectMemory["apollo"];
  themis: ProjectMemory["themis"];
  ares: ProjectMemory["ares"];
  hephaestus: ProjectMemory["hephaestus"];
  zeus: ProjectMemory["zeus"];
  stageMetadata: StageMetadata[];
}

export function assembleWorkspace(memory: ProjectMemory, stageRuns: StageRunRow[]): StartupWorkspace {
  const stageMetadata: StageMetadata[] = ALL_STAGES.map((stage) => {
    const runs = stageRuns.filter((r) => r.stage === stage).sort((a, b) => a.attempt_number - b.attempt_number);
    const last = runs[runs.length - 1];
    return {
      agent: stage,
      attempts: runs.length,
      finalArgusScore: last?.argus_score ?? null,
      finalArgusDecision: last?.argus_decision ?? null,
    };
  });

  return {
    athena: memory.athena,
    hermes: memory.hermes,
    apollo: memory.apollo,
    themis: memory.themis,
    ares: memory.ares,
    hephaestus: memory.hephaestus,
    zeus: memory.zeus,
    stageMetadata,
  };
}
