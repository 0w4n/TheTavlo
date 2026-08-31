import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  type Firestore,
  updateDoc,
  deleteDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import type {
  AnyTask,
  CreateAnyTaskDTO,
  UpdateAnyTaskDTO,
} from "../domain/task.entity";
import type { TaskRepository } from "../app/taskRepository.interface";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { firebaseErr, type AppErr } from "#core/appCore/domain/AppCore.type";
import { withoutId } from "#core/appCore/infraestructure/firebase/withoutId";
import { taskConverter } from "./task.converter";

export class FirebaseTaskRepository implements TaskRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  private getCollectionPath(): string {
    const ctx = this.getContext();
    const { panelId } = ctx.state.panel;

    if (panelId.length > 0) {
      const { accountType, ownerId } = resolvePanelOwner(ctx);
      return `${accountType}/${ownerId}/panels/${panelId}/tasks`;
    }
    // Sin panel activo: solo puede referirse a los paneles propios del
    // usuario actual (nunca a los de un dueño ajeno).
    const { userId, accountType } = ctx.state.user;
    return `${accountType}/${userId}/panels`;
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    return ctx;
  }

  private collectionRef() {
    return collection(this.firestore, this.getCollectionPath()).withConverter(
      taskConverter,
    );
  }

  private docRef(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id).withConverter(
      taskConverter,
    );
  }

  // ─── Suscripción en tiempo real ───────────────────────────────────────────

  /**
   * Escucha las tareas del panel activo en tiempo real.
   * La primera emisión entrega todas las tareas actuales;
   * las siguientes reflejan creates, updates y deletes sin polling.
   */
  subscribe(
    onData: (tasks: AnyTask[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    const q = query(this.collectionRef());

    return onSnapshot(
      q,
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async findAll(): Promise<AnyTask[]> {
    const snap = await getDocs(query(this.collectionRef()));
    return snap.docs.map((d) => d.data());
  }

  async findById(id: string): Promise<AnyTask | null> {
    const docSnap = await getDoc(this.docRef(id));
    return docSnap.exists() ? docSnap.data() : null;
  }

  // ─── Mutaciones ───────────────────────────────────────────────────────────

  async create(data: CreateAnyTaskDTO): Promise<AnyTask> {
    const now = Timestamp.now();
    const taskData = { ...data, createdAt: now, updatedAt: now } as AnyTask;

    const docRef = await addDoc(this.collectionRef(), taskData);
    return { ...taskData, id: docRef.id };
  }

  async update(id: string, data: UpdateAnyTaskDTO): Promise<AnyTask> {
    const now = Timestamp.fromDate(new Date());
    const updateData = withoutId({ ...data, updatedAt: now });

    await updateDoc(this.docRef(id), updateData);

    return { id, ...updateData } as AnyTask;
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }
}
