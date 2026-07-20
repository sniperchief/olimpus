import type { ArgusVerdict, FounderInput, ProjectMemory, StageName } from "../memory/types.js";

export interface RevisionContext {
  previousOutput: unknown;
  verdict: ArgusVerdict;
}

export interface RunPersonaArgs {
  founderInput: FounderInput;
  memory: ProjectMemory;
  revision: RevisionContext | null;
}

export type { ArgusVerdict, StageName };
