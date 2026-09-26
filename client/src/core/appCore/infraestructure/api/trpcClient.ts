import { firebaseService } from "#core/appCore/infraestructure/firebase/firebaseConfig";

export function resolveApiBaseUrl(env: Record<string, string | undefined> = import.meta.env): string {
  const candidate = env.CLIENT_API_BASE_URL ?? env.CLIENT_BACKEND_URI ?? "http://localhost:3080";
  const value = String(candidate).trim().replace(/\/+$/, "");

  if (!value) {
    return "http://localhost:3080";
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
    public httpStatus: number,
    public trpcCode?: string, // "UNAUTHORIZED", "NOT_FOUND", etc.
  ) {
    super(message);
    this.name = "TRPCRequestError";
  }
}

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);

  if (!body) {
    // 200 con cuerpo no-JSON: normalmente significa que pegamos contra el
    // fallback de la SPA (index.html) en vez del backend real.
    throw new TRPCRequestError(
      `Respuesta inesperada del servidor (status ${res.status})`,
      res.status,
    );
  }
  if (!res.ok || body.error) {
    throw new TRPCRequestError(
      body?.error?.message ?? `Error de red (${res.status})`,
      res.status,
      body?.error?.data?.code,
    );
  }
  return body.result.data as T;
}

async function authHeaders(forceRefresh = false): Promise<HeadersInit> {
  await firebaseService.auth.authStateReady();
  const user = firebaseService.auth.currentUser;

  if (!user) {
    throw new TRPCRequestError("Necesitas iniciar sesión.", 401, "UNAUTHORIZED");
  }
  const token = await user.getIdToken(forceRefresh);
  return { Authorization: `Bearer ${token}` };
}

function isUnauthorized(error: unknown): error is TRPCRequestError {
  return (
    error instanceof TRPCRequestError &&
    (error.httpStatus === 401 || error.trpcCode === "UNAUTHORIZED")
  );
}

/**
 * Llama a un procedure tRPC tipo `query` (GET, `?input=<json>`).
 * Nota: `client/` y `backend/` todavía son dos repos separados (no un
 * monorepo — ver auditoría, sección C), así que esto NO tiene el tipado
 * end-to-end real de tRPC; cada caller tipa manualmente su respuesta,
 * sincronizado a mano con los routers del backend (carpeta src/features).
 */
export async function trpcQuery<T>(path: string, input: unknown): Promise<T> {
  const url = `${API_BASE_URL}/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`;
  for (const forceRefresh of [false, true]) {
    const headers = await authHeaders(forceRefresh);
    console.log("Fetching tRPC query:", url, "with headers:", headers);
    let res: Response;
    try {
      console.log("Sending request to:", url, "with headers:", headers);
      res = await fetch(url, { headers });
      console.log("Received response:", res);
    } catch {
      throw new TRPCRequestError("No se pudo contactar al servidor.", 0);
    }

    try {
      return await handle<T>(res);
    } catch (error) {
      if (!forceRefresh && isUnauthorized(error)) continue;
      throw error;
    }
  }

  throw new TRPCRequestError("No se pudo autenticar la sesión.", 401, "UNAUTHORIZED");
}

/** Llama a un procedure público que no necesita sesión de Firebase. */
export async function trpcPublicQuery<T>(path: string, input: unknown): Promise<T> {
  const url = `${API_BASE_URL}/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new TRPCRequestError("No se pudo contactar al servidor.", 0);
  }
  return handle<T>(res);
}

/** Llama a un procedure tRPC tipo `mutation` (POST, body JSON). */
export async function trpcMutation<T>(path: string, input: unknown): Promise<T> {
  const url = `${API_BASE_URL}/api/trpc/${path}`;
  for (const forceRefresh of [false, true]) {
    const headers = await authHeaders(forceRefresh);
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    try {
      return await handle<T>(res);
    } catch (error) {
      if (!forceRefresh && isUnauthorized(error)) continue;
      throw error;
    }
  }

  throw new TRPCRequestError("No se pudo autenticar la sesión.", 401, "UNAUTHORIZED");
}
