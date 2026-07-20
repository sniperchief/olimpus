import { ValidationError } from "../../errors.js";
import { SessionStore } from "../../memory/sessionStore.js";
import { EventStore } from "../../memory/eventStore.js";
import { runSession } from "../../orchestrator/workflow.js";
import { sessionToTask } from "../taskMapper.js";
import type { FounderInput } from "../../memory/types.js";

interface MessagePart {
  kind: string;
  data?: Record<string, unknown>;
  text?: string;
}

interface MessageSendParams {
  message: {
    role: string;
    messageId: string;
    parts: MessagePart[];
  };
}

function extractFounderInput(params: unknown): FounderInput {
  const p = params as MessageSendParams;
  const parts = p?.message?.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new ValidationError("message.parts must be a non-empty array");
  }

  const dataPart = parts.find((part) => part.kind === "data" && part.data);
  if (dataPart?.data) {
    const { idea, targetAudience, primaryGoal } = dataPart.data as Record<string, unknown>;
    if (typeof idea !== "string" || !idea.trim()) {
      throw new ValidationError("founder input requires a non-empty 'idea' string");
    }
    if (typeof primaryGoal !== "string" || !primaryGoal.trim()) {
      throw new ValidationError("founder input requires a non-empty 'primaryGoal' string");
    }
    return {
      idea,
      primaryGoal,
      ...(typeof targetAudience === "string" && targetAudience.trim() ? { targetAudience } : {}),
    };
  }

  const textPart = parts.find((part) => part.kind === "text" && part.text);
  if (textPart?.text) {
    return { idea: textPart.text, primaryGoal: "Launch an MVP and validate product-market fit" };
  }

  throw new ValidationError("message.parts must contain a 'data' part with founder input, or a 'text' part");
}

export function createMessageSendHandler(sessionStore: SessionStore, eventStore: EventStore) {
  return async (params: unknown) => {
    const founderInput = extractFounderInput(params);
    const session = sessionStore.create(founderInput);

    runSession(session.id, sessionStore, eventStore).catch((err) => {
      sessionStore.updateStatus(session.id, "failed", err instanceof Error ? err.message : "Unknown error");
    });

    return sessionToTask(sessionStore.get(session.id), []);
  };
}
