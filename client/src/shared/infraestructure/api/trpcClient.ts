import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";

export function resolveApiBaseUrl(env: Record<string, string | undefined> = import.meta.env): string {
  const candidate = env.VITE_API_BASE_URL ?? env.VITE_BACKEND_URI ?? "http://localhost:3000";
  const value = String(candidate).trim().replace(/\/+$/, "");

  if (!value) {
    return "http://localhost:3000";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const isLocalHost = /^(localhost|127\.0\.0\.1)(?::\d+)?$/i.test(value);
  return `${isLocalHost ? "http" : "https"}://${value}`;
}

const API_BASE_URL = resolveApiBaseUrl();

export class TRPCRequestError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "TRPCRequestError";
  }
}

async function authHeaders(): Promise<HeadersInit> {
  const user = firebaseService.auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.error) {
    throw new TRPCRequestError(
      body?.error?.message ?? `Error de red (${res.status})`,
      body?.error?.data?.code,
    );
  }
  return body.result.data as T;
}

/**
 * Llama a un procedure tRPC tipo `query` (GET, `?input=<json>`).
 * Nota: `client/` y `backend/` todavía son dos repos separados (no un
 * monorepo — ver auditoría, sección C), así que esto NO tiene el tipado
 * end-to-end real de tRPC; cada caller tipa manualmente su respuesta,
 * sincronizado a mano con los routers del backend (carpeta src/features).
 */
export async function trpcQuery<T>(path: string, input: unknown): Promise<T> {
  const headers = await authHeaders();
  const url = `${API_BASE_URL}/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`;
  const res = await fetch(url, { headers });
  return handle<T>(res);
}

/** Llama a un procedure tRPC tipo `mutation` (POST, body JSON). */
export async function trpcMutation<T>(path: string, input: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/trpc/${path}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle<T>(res);
}
