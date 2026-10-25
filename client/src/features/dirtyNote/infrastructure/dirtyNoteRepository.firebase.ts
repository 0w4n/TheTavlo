import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { firebaseErr, type AppErr } from "#core/appCore/domain/AppCore.type";
import type { GlobalContextValue } from "#core/globalContext/context/globalContex.type";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import type { DirtyNoteRepository } from "../app/DirtyNoteRepository.interface";
import type {
  CreateDirtyNoteDTO,
  DirtyNote,
  DirtyNoteChanges,
  UpdateDirtyNoteDTO,
} from "../domain/DirtyNote.entity";
import { dirtyNoteConverter } from "./dirtyNote.converter";
import { buildDirtyNoteCollectionPath } from "./dirtyNotePath";

export class FirebaseDirtyNoteRepository implements DirtyNoteRepository {
  constructor(
    private readonly firestore: Firestore,
    private readonly getCurrentContext: () => GlobalContextValue,
  ) {}

  private getCollectionPath(): string {
    const ctx = this.getCurrentContext();
    if (ctx.state.status !== "ready") {
      throw new Error("GlobalContext aún no está listo");
    }
    const { panelId } = ctx.state.state.panel;
    const { accountType, ownerId } = resolvePanelOwner(ctx);

    return buildDirtyNoteCollectionPath({ accountType, ownerId, panelId });
  }

  // Lecturas: referencias con converter (devuelven `DirtyNote` ya normalizado).
  private readCollection() {
    return collection(this.firestore, this.getCollectionPath()).withConverter(
      dirtyNoteConverter,
    );
  }

  private readDoc(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id).withConverter(
      dirtyNoteConverter,
    );
  }

  // Escrituras: referencias planas. Se arma el documento a mano (sin `id`)
  // en vez de pasar por el converter, cuyo tipo exige un `DirtyNote`
  // completo y `updateDoc` ni siquiera lo usa.
  private writeCollection() {
    return collection(this.firestore, this.getCollectionPath());
  }

  private writeDoc(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id);
  }

  // ─── Suscripción en tiempo real ──────────────────────────────────────────

  subscribe(
    onData: (dirtyNotes: DirtyNote[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    try {
      return onSnapshot(
        query(this.readCollection()),
        (snap) => onData(snap.docs.map((d) => d.data())),
        (error) => onError(firebaseErr(error.message, error.code, error.stack)),
      );
    } catch (error) {
      // p. ej. no hay panel activo todavía. La UI muestra el error en vez de
      // que la excepción tumbe el árbol de React desde un useEffect.
      onError(
        firebaseErr(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las DirtyNote.",
          undefined,
          error instanceof Error ? error.stack : undefined,
        ),
      );
      return () => {};
    }
  }

  // ─── Lecturas puntuales ──────────────────────────────────────────────────

  async findAll(): Promise<DirtyNote[]> {
    const snap = await getDocs(query(this.readCollection()));
    return snap.docs.map((d) => d.data());
  }

  async findById(id: string): Promise<DirtyNote | null> {
    const snap = await getDoc(this.readDoc(id));
    return snap.exists() ? snap.data() : null;
  }

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  async create(data: CreateDirtyNoteDTO): Promise<DirtyNote> {
    const now = Timestamp.now();
    const payload = {
      title: data.title,
      content: data.content,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await addDoc(this.writeCollection(), payload);
    return { id: ref.id, ...payload };
  }

  async update(id: string, data: UpdateDirtyNoteDTO): Promise<DirtyNoteChanges> {
    // Firestore rechaza `undefined`: solo se envían los campos presentes.
    const changes: UpdateDirtyNoteDTO = {};
    if (data.title !== undefined) changes.title = data.title;
    if (data.content !== undefined) changes.content = data.content;
    if (data.status !== undefined) changes.status = data.status;

    const updatedAt = Timestamp.now();
    await updateDoc(this.writeDoc(id), { ...changes, updatedAt });

    return { id, ...changes, updatedAt };
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.writeDoc(id));
  }
}
