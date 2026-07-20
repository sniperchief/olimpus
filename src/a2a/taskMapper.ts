import type { SessionRow, SessionStatus, StageRunRow } from "../memory/types.js";
import { assembleWorkspace } from "../orchestrator/assembleWorkspace.js";

const STATE_MAP: Record<SessionStatus, string> = {
  submitted: "submitted",
  working: "working",
  completed: "completed",
  failed: "failed",
  canceled: "canceled",
};

export function sessionToTask(session: SessionRow, stageRuns: StageRunRow[]) {
  const memory = JSON.parse(session.memory_json);
  const state = STATE_MAP[session.status];

  const task: Record<string, unknown> = {
    id: session.id,
    contextId: session.id,
    kind: "task",
    status: {
      state,
      timestamp: session.updated_at,
      ...(session.error_message ? { message: session.error_message } : {}),
    },
    history: [],
  };

  if (session.status === "completed") {
    const workspace = assembleWorkspace(memory, stageRuns);
    task.artifacts = [
      {
        artifactId: `workspace-${session.id}`,
        name: "Startup Workspace",
        parts: [{ kind: "data", data: workspace }],
      },
    ];
  }

  return task;
}
