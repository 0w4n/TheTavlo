import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context.ts";

const t = initTRPC.context<Context>().create();

const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  console.log(`🚀 Petición entrante: [${type}] -> ${path}`); // <-- Verás esto siempre
  return next();
});

export const router = t.router;
export const middleware = t.middleware;
export const procedure = t.procedure.use(loggerMiddleware);


/** Sin requisito de sesión (ej. resolveAccess, que debe funcionar con un link sin login). */
export const publicProcedure = procedure;

/** Exige sesión válida. Dentro del procedure, `ctx.user` ya no es nullable. */
export const protectedProcedure = procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Necesitas iniciar sesión." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
