import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context.ts";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;

/** Sin requisito de sesión (ej. resolveAccess, que debe funcionar con un link sin login). */
export const publicProcedure = t.procedure;

/** Exige sesión válida. Dentro del procedure, `ctx.user` ya no es nullable. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Necesitas iniciar sesión." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
