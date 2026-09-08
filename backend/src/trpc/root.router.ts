import { router } from "./trpc.ts";
import { invitationsRouter } from "../features/invitations/invitations.router.ts";
import { suggestionsRouter } from "../features/suggestions/suggestions.router.ts";
import { panelsRouter } from "../features/panels/panels.router.ts";
import { widgetsRouter } from "../features/widgets/widgets.router.ts";
import { eventsRouter } from "../features/events/events.router.ts";
import { tasksRouter } from "../features/task/tasks.router.ts";
import { migrationRouter } from "../features/invitations/migration.router.ts";
import { notesRouter } from "../features/note/notes.router.ts";
import { scheduleRouter } from "../features/schedule/schedule.router.ts";
import { cookingBookRouter } from "../features/cookingBook/cookingBook.router.ts";

export const appRouter = router({
  invitations: invitationsRouter,
  suggestions: suggestionsRouter,
  panels: panelsRouter,
  widgets: widgetsRouter,
  events: eventsRouter,
  tasks: tasksRouter,
  migration: migrationRouter,
  notes: notesRouter,
  schedule: scheduleRouter,
  cookingBook: cookingBookRouter
});

// Tipo que el cliente necesita para tener autocompletado + type-safety end
// to end (`createTRPCProxyClient<AppRouter>`). Hoy client/ y backend/ son
// dos .zip separados, no un monorepo — hasta que eso se resuelva (ver
// sección C de la auditoría), este tipo no se puede *importar* de verdad
// desde el cliente; hay que copiarlo o publicarlo como paquete.
export type AppRouter = typeof appRouter;
