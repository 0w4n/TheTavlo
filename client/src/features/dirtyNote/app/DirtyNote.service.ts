import type { Unsubscribe } from "firebase/firestore";
import {
  authErr,
  err,
  firebaseErr,
  ok,
  type AppErr,
  type ResultApp,
} from "#core/appCore/domain/AppCore.type";
import type {
  CreateDirtyNoteDTO,
  DirtyNote,
  DirtyNoteChanges,
  UpdateDirtyNoteDTO,
} from "../domain/DirtyNote.entity";
import { DirtyNoteRules } from "../domain/DirtyNote.rules";
import type { DirtyNoteRepository } from "./DirtyNoteRepository.interface";

/**
 * Traduce cualquier excepción del repositorio a un `AppErr` con un mensaje
 * accionable (qué pasó + qué hacer), sin filtrar el detalle técnico a la UI.
 */
function toAppErr(error: unknown, fallbackMessage: string): AppErr {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : undefined;
  const stack = error instanceof Error ? error.stack : undefined;

  if (code === "permission-denied" || code === "FORBIDDEN") {
    return authErr(
      "No tienes permiso para modificar esta DirtyNote. Pide al dueño del panel que te dé acceso de editor.",
      stack,
    );
  }
  return firebaseErr(fallbackMessage, code, stack);
}

export class DirtyNoteService {
  constructor(private readonly repository: DirtyNoteRepository) {}

  // ─── Suscripción / lecturas ──────────────────────────────────────────────

  subscribe(
    onData: (dirtyNotes: DirtyNote[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.repository.subscribe(onData, onError);
  }

  getAll(): Promise<DirtyNote[]> {
    return this.repository.findAll();
  }

  getById(id: string): Promise<DirtyNote | null> {
    return this.repository.findById(id);
  }

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  async create(data: CreateDirtyNoteDTO): Promise<ResultApp<DirtyNote, AppErr>> {
    const valid = DirtyNoteRules.validateCreate(data);
    if (!valid.success) return valid;

    try {
      return ok(await this.repository.create(valid.value));
    } catch (error) {
      return err(
        toAppErr(
          error,
          "No se pudo crear la DirtyNote. Verifica tu conexión e intenta nuevamente.",
        ),
      );
    }
  }

  async update(
    id: string,
    data: UpdateDirtyNoteDTO,
  ): Promise<ResultApp<DirtyNoteChanges, AppErr>> {
    const valid = DirtyNoteRules.validateUpdate(data);
    if (!valid.success) return valid;

    try {
      return ok(await this.repository.update(id, valid.value));
    } catch (error) {
      return err(
        toAppErr(
          error,
          "No se pudo guardar la DirtyNote. Verifica tu conexión e intenta nuevamente.",
        ),
      );
    }
  }

  async delete(id: string): Promise<ResultApp<void, AppErr>> {
    try {
      await this.repository.delete(id);
      return ok(undefined);
    } catch (error) {
      return err(
        toAppErr(
          error,
          "No se pudo eliminar la DirtyNote. Verifica tu conexión e intenta nuevamente.",
        ),
      );
    }
  }
}
