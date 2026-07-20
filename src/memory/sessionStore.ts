import type { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors.js";
import {
  createInitialMemory,
  type FounderInput,
  type ProjectMemory,
  type SessionRow,
  type SessionStatus,
  type StageName,
} from "./types.js";

export class SessionStore {
  constructor(private db: DatabaseSync) {}

  create(founderInput: FounderInput): SessionRow {
    const id = randomUUID();
    const memory = createInitialMemory(founderInput);
    this.db
      .prepare(
        `INSERT INTO sessions (id, status, current_stage, memory_json, founder_input_json)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(id, "submitted", "athena", JSON.stringify(memory), JSON.stringify(founderInput));
    return this.get(id);
  }

  get(id: string): SessionRow {
    const row = this.db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(id) as
      | SessionRow
      | undefined;
    if (!row) throw new NotFoundError(`Session not found: ${id}`);
    return row;
  }

  getMemory(id: string): ProjectMemory {
    return JSON.parse(this.get(id).memory_json) as ProjectMemory;
  }

  updateStatus(id: string, status: SessionStatus, errorMessage?: string): void {
    this.db
      .prepare(
        `UPDATE sessions SET status = ?, error_message = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
      )
      .run(status, errorMessage ?? null, id);
  }

  saveMemory(id: string, memory: ProjectMemory, currentStage: StageName | "done"): void {
    this.db
      .prepare(
        `UPDATE sessions SET memory_json = ?, current_stage = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
      )
      .run(JSON.stringify(memory), currentStage, id);
  }

  setCurrentStage(id: string, currentStage: StageName): void {
    this.db
      .prepare(
        `UPDATE sessions SET current_stage = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
      )
      .run(currentStage, id);
  }
}
