import type { DatabaseSync } from "node:sqlite";
import type { ArgusVerdict, StageName, StageRunRow } from "./types.js";

export class EventStore {
  constructor(private db: DatabaseSync) {}

  record(
    sessionId: string,
    stage: StageName,
    attemptNumber: number,
    agentOutput: unknown,
    verdict: ArgusVerdict
  ): void {
    this.db
      .prepare(
        `INSERT INTO stage_runs
           (session_id, stage, attempt_number, agent_output_json, argus_score, argus_decision, argus_feedback_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        sessionId,
        stage,
        attemptNumber,
        JSON.stringify(agentOutput),
        verdict.score,
        verdict.decision,
        JSON.stringify({
          strengths: verdict.strengths,
          weaknesses: verdict.weaknesses,
          recommendations: verdict.recommendations,
        })
      );
  }

  forSession(sessionId: string): StageRunRow[] {
    return this.db
      .prepare(`SELECT * FROM stage_runs WHERE session_id = ? ORDER BY id ASC`)
      .all(sessionId) as unknown as StageRunRow[];
  }
}
