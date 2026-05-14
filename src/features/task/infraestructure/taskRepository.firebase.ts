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
} from "firebase/firestore";
import type { CreateTaskDTO, Task, UpdateTaskDTO } from "../domain/task.entity";
import type { TaskRepository } from "../app/taskRepository.interface";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";

export class FirebaseTaskRepository implements TaskRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  private getCollectionPath(): string {
    const { userId, accountType } = this.getContext().state.user;
    const { panelId } = this.getContext().state.panel;
    return `${accountType}/${userId}/panels/${panelId}/task`;
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    if (!ctx) {
      throw new Error("GlobalContext no disponible");
    }
    return ctx;
  }

  private mapDocumentToTask(id: string, data: DocumentData): Task {
    const task: any = { ...data };

    return {
      id: id,
      title: task.title,
      progress: task.progress,
      endAt: task.endAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private mapTaskToDocument(task: Partial<Task>): DocumentData {
    const data: any = { ...task };

    console.log("taskData: ", data);

    if (task.endAt) {
      data.dueDate = Timestamp.fromDate(task.endAt.toDate());
    }
    if (task.createdAt) {
      data.createdAt = Timestamp.fromDate(task.createdAt.toDate());
    }
    if (task.updatedAt) {
      data.updatedAt = Timestamp.fromDate(task.updatedAt.toDate());
    }

    delete data.id; // No guardar el id en el documento

    return data;
  }

  async findAll(): Promise<Task[]> {
    const collectionName = this.getCollectionPath();

    const q = query(collection(this.firestore, collectionName));

    console.log("Query: ", q);

    const querySnapshot = await getDocs(q);
    querySnapshot.docs.map(doc => console.log("taskRepo-querySnapshot: ", doc.data()));
    return querySnapshot.docs.map((doc) =>
      this.mapDocumentToTask(doc.id, { ...doc.data() }),
    );
  }

  async findById(id: string): Promise<Task | null> {
    const collectionName = this.getCollectionPath();

    const docRef = doc(this.firestore, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const task = this.mapDocumentToTask(docSnap.id, { ...docSnap });

    return task;
  }

  async create(data: CreateTaskDTO): Promise<Task> {
    const collectionName = this.getCollectionPath();

    const taskData = this.mapTaskToDocument({
      ...data,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    });

    const docRef = await addDoc(
      collection(this.firestore, collectionName),
      taskData,
    );

    return this.mapDocumentToTask(docRef.id, { ...docRef });
  }

  async update(id: string, data: UpdateTaskDTO): Promise<Task> {
    const collectionName = this.getCollectionPath();

    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await this.findById(id);
    if (!existingTask) {
      throw new Error("Tarea no encontrada");
    }

    const updateData = this.mapTaskToDocument({
      ...data,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    const docRef = doc(this.firestore, collectionName, id);
    await updateDoc(docRef, updateData);

    return this.mapDocumentToTask(id, docRef);
  }

  async delete(id: string): Promise<void> {
    const collectionName = this.getCollectionPath();

    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await this.findById(id);
    if (!existingTask) {
      throw new Error("Tarea no encontrada");
    }

    const docRef = doc(this.firestore, collectionName, id);
    await deleteDoc(docRef);
  }
}
