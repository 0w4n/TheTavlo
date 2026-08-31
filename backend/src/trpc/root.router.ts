import { router } from "./trpc.ts";
import { invitationsRouter } from "../features/invitations/invitations.router.ts";

export const appRouter = router({
  invitations: invitationsRouter,
});

// Tipo que el cliente necesita para tener autocompletado + type-safety end
// to end (`createTRPCProxyClient<AppRouter>`). Hoy client/ y backend/ son
// dos .zip separados, no un monorepo — hasta que eso se resuelva (ver
// sección C de la auditoría), este tipo no se puede *importar* de verdad
// desde el cliente; hay que copiarlo o publicarlo como paquete.
export type AppRouter = typeof appRouter;
