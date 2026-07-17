import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  type DocumentData,
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

export class FirebaseTaskRepository implements TaskRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  private getCollectionPath(): string {
    const {
      user: { userId, accountType },
      panel: { panelId },
    } = this.getContext().state;

    if (panelId.length > 0) {
      return `${accountType}/${userId}/panels/${panelId}/tasks`;
    } else {
      return `${accountType}/${userId}/panels`;
    }
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    return ctx;
  }

  private mapDocumentToAnyTask(id: string, data: DocumentData): AnyTask {
    return {
      id,
      title: data.title,
      progress: data.progress,
      phase: data.phase,
      endAt: data.endAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      openAt: data.openAt,
      submission: data.submission,
    };
  }

  private mapAnyTaskToDocument(task: Partial<AnyTask>): DocumentData {
    const data: any = { ...task };
    if (task.endAt) data.endAt = task.endAt;
    if (task.createdAt) data.createdAt = task.createdAt;
    if (task.updatedAt) data.updatedAt = task.updatedAt;
    delete data.id;
    return data;
  }

  // ─── Suscripción en tiempo real ───────────────────────────────────────────

  /**
   * Escucha las tareas del panel activo en tiempo real.
   * La primera emisión entrega todas las tareas actuales;
   * las siguientes reflejan creates, updates y deletes sin polling.
   */
  subscribe(
    onData: (tasks: AnyTask[]) => void,
    onError: (err: Error) => void,
  ): Unsubscribe {
    const collectionName = this.getCollectionPath();
    const q = query(collection(this.firestore, collectionName));

    return onSnapshot(
      q,
      (snap) => {
        const tasks = snap.docs.map((d) =>
          this.mapDocumentToAnyTask(d.id, d.data()),
        );
        onData(tasks);
      },
      (error) => onError(new Error(error.message)),
    );
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async findAll(): Promise<AnyTask[]> {
    const q = query(collection(this.firestore, this.getCollectionPath()));
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.mapDocumentToAnyTask(d.id, d.data()));
  }

  async findById(id: string): Promise<AnyTask | null> {
    const docRef = doc(this.firestore, this.getCollectionPath(), id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return this.mapDocumentToAnyTask(docSnap.id, docSnap.data());
  }

  // ─── Mutaciones ───────────────────────────────────────────────────────────

  async create(data: CreateAnyTaskDTO): Promise<AnyTask> {
    const now = Timestamp.now();
    const taskData = this.mapAnyTaskToDocument({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    const docRef = await addDoc(
      collection(this.firestore, this.getCollectionPath()),
      taskData,
    );

    return this.mapDocumentToAnyTask(docRef.id, { ...taskData });
  }

  async update(id: string, data: UpdateAnyTaskDTO): Promise<AnyTask> {
    const collectionName = this.getCollectionPath();
    const now = Timestamp.fromDate(new Date());

    const updateData = this.mapAnyTaskToDocument({ ...data, updatedAt: now });
    const docRef = doc(this.firestore, collectionName, id);
    await updateDoc(docRef, updateData);

    return this.mapDocumentToAnyTask(updateData.id, updateData.data());
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.getCollectionPath(), id);
    await deleteDoc(docRef);
  }
}
