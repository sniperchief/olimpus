import { ValidationError } from "../../errors.js";
import { SessionStore } from "../../memory/sessionStore.js";
import { EventStore } from "../../memory/eventStore.js";
import { sessionToTask } from "../taskMapper.js";

interface TasksGetParams {
  id: string;
}

export function createTasksGetHandler(sessionStore: SessionStore, eventStore: EventStore) {
  return async (params: unknown) => {
    const { id } = (params ?? {}) as TasksGetParams;
    if (typeof id !== "string" || !id) {
      throw new ValidationError("params.id is required");
    }
    const session = sessionStore.get(id);
    const stageRuns = eventStore.forSession(id);
    return sessionToTask(session, stageRuns);
  };
}
