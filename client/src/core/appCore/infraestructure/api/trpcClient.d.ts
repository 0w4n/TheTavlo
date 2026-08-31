export declare class TRPCRequestError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
/**
 * Llama a un procedure tRPC tipo `query` (GET, `?input=<json>`).
 * Nota: `client/` y `backend/` todavía son dos repos separados (no un
 * monorepo — ver auditoría, sección C), así que esto NO tiene el tipado
 * end-to-end real de tRPC; cada caller tipa manualmente su respuesta,
 * sincronizado a mano con los routers del backend (carpeta src/features).
 */
export declare function trpcQuery<T>(path: string, input: unknown): Promise<T>;
/** Llama a un procedure tRPC tipo `mutation` (POST, body JSON). */
export declare function trpcMutation<T>(path: string, input: unknown): Promise<T>;
