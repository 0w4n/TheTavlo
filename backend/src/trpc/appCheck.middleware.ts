import { TRPCError } from "@trpc/server";
import { getAppCheck } from "firebase-admin/app-check";
import { middleware, publicProcedure } from "./trpc.js";

export const requireAppCheckMiddleware = middleware(async ({ ctx, next }) => {
  const token = ctx.appCheckToken; // leído de header X-Firebase-AppCheck en createContext
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED", message: "Falta verificación de app." });
  try {
    await getAppCheck().verifyToken(token);
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Verificación de app inválida." });
  }
  return next();
});

export const appCheckedPublicProcedure = publicProcedure.use(requireAppCheckMiddleware);