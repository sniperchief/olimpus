import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { buildAgentCard } from "./a2a/agentCard.js";
import { parseJsonRpcRequest, dispatch, type MethodHandler } from "./a2a/jsonrpc.js";
import { createMessageSendHandler } from "./a2a/methods/messageSend.js";
import { createTasksGetHandler } from "./a2a/methods/tasksGet.js";
import { SessionStore } from "./memory/sessionStore.js";
import { EventStore } from "./memory/eventStore.js";
import { PayloadTooLargeError } from "./errors.js";
import type { DatabaseSync } from "node:sqlite";

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB — founder input is small; this is a generous ceiling, not a real limit.

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    req.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        req.destroy();
        reject(new PayloadTooLargeError(`Request body exceeds ${MAX_BODY_BYTES} bytes`));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body);
}

export function createApp(db: DatabaseSync) {
  const sessionStore = new SessionStore(db);
  const eventStore = new EventStore(db);

  const methods: Record<string, MethodHandler> = {
    "message/send": createMessageSendHandler(sessionStore, eventStore),
    "tasks/get": createTasksGetHandler(sessionStore, eventStore),
  };

  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET" && req.url === "/.well-known/agent-card.json") {
      sendJson(res, 200, buildAgentCard());
      return;
    }

    if (req.method === "POST" && req.url === "/") {
      try {
        const raw = await readBody(req);
        const parsed = parseJsonRpcRequest(JSON.parse(raw));
        const response = await dispatch(parsed, methods);
        sendJson(res, 200, response);
      } catch (err) {
        const status = err instanceof PayloadTooLargeError ? 413 : 400;
        sendJson(res, status, {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: err instanceof Error ? err.message : "Parse error" },
        });
      }
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  };
}

export function startServer(db: DatabaseSync, port: number) {
  const app = createApp(db);
  const server = createServer(app);
  server.listen(port, () => {
    console.log(`Olimpus A2A server listening on http://localhost:${port}`);
  });
  return server;
}
