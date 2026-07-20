import { ValidationError } from "../errors.js";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number | null;
  method: string;
  params?: unknown;
}

export interface JsonRpcSuccess {
  jsonrpc: "2.0";
  id: string | number | null;
  result: unknown;
}

export interface JsonRpcError {
  jsonrpc: "2.0";
  id: string | number | null;
  error: { code: number; message: string };
}

export function parseJsonRpcRequest(body: unknown): JsonRpcRequest {
  if (
    typeof body !== "object" ||
    body === null ||
    (body as Record<string, unknown>).jsonrpc !== "2.0" ||
    typeof (body as Record<string, unknown>).method !== "string"
  ) {
    throw new ValidationError("Malformed JSON-RPC 2.0 request");
  }
  return body as JsonRpcRequest;
}

export type MethodHandler = (params: unknown) => Promise<unknown>;

export async function dispatch(
  request: JsonRpcRequest,
  methods: Record<string, MethodHandler>
): Promise<JsonRpcSuccess | JsonRpcError> {
  const handler = methods[request.method];
  if (!handler) {
    return { jsonrpc: "2.0", id: request.id, error: { code: -32601, message: `Unknown method: ${request.method}` } };
  }
  try {
    const result = await handler(request.params);
    return { jsonrpc: "2.0", id: request.id, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    const code = err instanceof ValidationError ? -32602 : -32603;
    return { jsonrpc: "2.0", id: request.id, error: { code, message } };
  }
}
