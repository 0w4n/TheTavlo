import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
export class TRPCRequestError extends Error {
    constructor(message, code) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        this.name = "TRPCRequestError";
    }
}
async function authHeaders() {
    const user = firebaseService.auth.currentUser;
    if (!user)
        return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
}
async function handle(res) {
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.error) {
        throw new TRPCRequestError(body?.error?.message ?? `Error de red (${res.status})`, body?.error?.data?.code);
    }
    return body.result.data;
}
/**
 * Llama a un procedure tRPC tipo `query` (GET, `?input=<json>`).
 * Nota: `client/` y `backend/` todavía son dos repos separados (no un
 * monorepo — ver auditoría, sección C), así que esto NO tiene el tipado
 * end-to-end real de tRPC; cada caller tipa manualmente su respuesta,
 * sincronizado a mano con los routers del backend (carpeta src/features).
 */
export async function trpcQuery(path, input) {
    const headers = await authHeaders();
    const url = `${API_BASE_URL}/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`;
    const res = await fetch(url, { headers });
    return handle(res);
}
/** Llama a un procedure tRPC tipo `mutation` (POST, body JSON). */
export async function trpcMutation(path, input) {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE_URL}/trpc/${path}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return handle(res);
}
