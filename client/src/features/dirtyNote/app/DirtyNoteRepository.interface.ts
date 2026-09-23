import type { Unsubscribe } from "firebase/firestore";
import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type {
  CreateDirtyNoteDTO,
  DirtyNote,
  DirtyNoteChanges,
  UpdateDirtyNoteDTO,
} from "../domain/DirtyNote.entity";

/**
 * Contrato de persistencia de las DirtyNote del panel activo. Hoy hay dos
 * implementaciones: Firestore directo (`FirebaseDirtyNoteRepository`, la que
 * usa App.tsx) y vía backend tRPC (`TrpcDirtyNoteRepository`).
 */
export interface DirtyNoteRepository {
  /**
   * Escucha las DirtyNote del panel activo. Emite la lista completa ante
   * cualquier cambio. Devuelve la función que cancela la suscripción.
   */
  subscribe(
    onData: (dirtyNotes: DirtyNote[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  findAll(): Promise<DirtyNote[]>;
  findById(id: string): Promise<DirtyNote | null>;
  create(data: CreateDirtyNoteDTO): Promise<DirtyNote>;
  update(id: string, data: UpdateDirtyNoteDTO): Promise<DirtyNoteChanges>;
  delete(id: string): Promise<void>;
}
