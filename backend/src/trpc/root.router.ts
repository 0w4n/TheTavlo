import { router } from "./trpc.js";
import { invitationsRouter } from "../features/invitations/invitations.router.js";
import { suggestionsRouter } from "../features/suggestions/suggestions.router.js";
import { panelsRouter } from "../features/panels/panels.router.js";
import { widgetsRouter } from "../features/widgets/widgets.router.js";
import { eventsRouter } from "../features/events/events.router.js";
import { tasksRouter } from "../features/task/tasks.router.js";
import { migrationRouter } from "../features/invitations/migration.router.js";
import { dirtyNoteRouter } from "../features/dirtyNote/dirtyNote.router.js";
import { scheduleRouter } from "../features/schedule/schedule.router.js";
import { cookingBookRouter } from "../features/cookingBook/cookingBook.router.js";

export const appRouter = router({
  invitations: invitationsRouter,
  suggestions: suggestionsRouter,
  panels: panelsRouter,
  widgets: widgetsRouter,
  events: eventsRouter,
  tasks: tasksRouter,
  migration: migrationRouter,
  dirtyNote: dirtyNoteRouter,
  schedule: scheduleRouter,
  cookingBook: cookingBookRouter
});

// Tipo que el cliente necesita para tener autocompletado + type-safety end
// to end (`createTRPCProxyClient<AppRouter>`). Hoy client/ y backend/ son
// dos .zip separados, no un monorepo — hasta que eso se resuelva (ver
// sección C de la auditoría), este tipo no se puede *importar* de verdad
// desde el cliente; hay que copiarlo o publicarlo como paquete.
export type AppRouter = typeof appRouter;
