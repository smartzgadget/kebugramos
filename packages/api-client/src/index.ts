import { z } from "zod";

export class ApiError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOpts = RequestInit & { idempotencyKey?: string };

export function createClient(getConfig: () => { apiBase: string; getToken?: () => string | null }) {
  async function request<T>(path: string, schema: z.ZodTypeAny, opts: FetchOpts = {}): Promise<T> {
    const { apiBase, getToken } = getConfig();
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as Record<string, string>) };
    const token = getToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;
    const res = await fetch(`${apiBase}${path}`, { ...opts, headers });
    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(String(res.status), `API ${res.status} ${path}`, body);
    }
    const json = await res.json();
    return schema.parse(json);
  }
  return { request, get: <T>(p: string, s: z.ZodTypeAny, o?: FetchOpts) => request(p, s, { ...o, method: "GET" }) as Promise<T>, post: <T>(p: string, s: z.ZodTypeAny, o?: FetchOpts) => request(p, s, { ...o, method: "POST" }) as Promise<T> };
}
