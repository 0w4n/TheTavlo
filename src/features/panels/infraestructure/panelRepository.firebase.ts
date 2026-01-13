import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  Timestamp,
  type DocumentData,
  Firestore,
} from "firebase/firestore";
import type { PanelRepository } from "../app/panelsRepository.interface";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import PanelRules from "../domain/panel.rules";
import type { GlobalContextValue } from "#core/globalContext/globalContext";

export class FirebasePanelsRepository implements PanelRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue
  ) {}

  private getCollectionPath(): string {
    const { userId, accountType } = this.getContext().state.user;
    return `${accountType}/${userId}/panels`;
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    if (!ctx) {
      throw new Error("GlobalContext no disponible");
    }
    return ctx;
  }

  /**
   * Convierte un DocumentData (con Timestamp) a la entidad Panel.
   * Se devuelve createdAt/updatedAt como Date | undefined y se incluye id.
   */
  private mapDocumentToPanel(id: string, data: DocumentData): Panel {
    const createdAtField = data.createdAt;
    const updatedAtField = data.updatedAt;

    return {
      id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      isDefault: !!data.isDefault,
      createdAt: createdAtField,
      updatedAt: updatedAtField,
      stats: data.stats ?? undefined,
    };
  }

  /**
   * Convierte una entidad Panel (o DTO parcial) a DocumentData para Firestore.
   * Soporta createdAt/updatedAt como Date o Timestamp. Elimina campos locales no persistibles.
   */
  private mapPanelToDocument(
    panel: Partial<Panel> | Partial<CreatePanelDTO>
  ): DocumentData {
    const data: any = { ...panel };

    // createdAt/updatedAt: si son Date -> Timestamp.fromDate(date), si ya son Timestamp dejar
    if (data.createdAt) {
      if (data.createdAt instanceof Date) {
        data.createdAt = Timestamp.fromDate(data.createdAt);
      } // si ya es Timestamp, OK
    } else {
      // si no existe createdAt, dejar vacío (create() añadirá createdAt)
      delete data.createdAt;
    }

    if (data.updatedAt) {
      if (data.updatedAt instanceof Date) {
        data.updatedAt = Timestamp.fromDate(data.updatedAt);
      } // si ya es Timestamp, OK
    } else {
      // si no existe, no forzamos
      delete data.updatedAt;
    }

    // Limpiar campos que no pertenecen al documento
    delete data.id;
    delete data.stats;

    return data as DocumentData;
  }

  // *C* = Crear
  async create(data: CreatePanelDTO): Promise<Panel> {
    const { userId } = this.getContext().state.user;
    const collectionPath = this.getCollectionPath();

    // Componer el objeto que persistiremos
    const rawDoc = {
      ...data,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const panelDoc = this.mapPanelToDocument(rawDoc);

    const docRef = await addDoc(
      collection(this.firestore, collectionPath),
      panelDoc
    );

    // Recuperar el documento recién creado para devolver la entidad con tipos correctos
    const createdSnap = await getDoc(docRef);
    if (!createdSnap.exists()) {
      throw new Error("No se pudo recuperar el panel recién creado");
    }
    return this.mapDocumentToPanel(createdSnap.id, createdSnap.data()!);
  }

  // *R* = Leer
  async findAll(): Promise<Panel[]> {
    const collectionPath = this.getCollectionPath();

    const q = query(
      collection(this.firestore, collectionPath)
    );

    const querySnapshot = await getDocs(q);
    const panels = querySnapshot.docs.map((docSnap) =>
      this.mapDocumentToPanel(docSnap.id, docSnap.data())
    );

    // Si no hay paneles, crear el panel por defecto
    if (panels.length === 0) {
      const defaultPanel = PanelRules.getDefaultPanel();
      const created = await this.create({
        name: defaultPanel.name,
        icon: defaultPanel.icon,
        isDefault: true,

        color: "blue",
      });
      return [created];
    }

    console.log("panels: ", panels)
    return panels;
  }

  async findById(id: string): Promise<Panel | null> {
    const collectionPath = this.getCollectionPath();

    const docRef = doc(this.firestore, collectionPath, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.mapDocumentToPanel(docSnap.id, docSnap.data());
  }

    // *U* = Actualizar
  async update(id: string, data: UpdatePanelDTO): Promise<Panel> {
    const collectionPath = this.getCollectionPath();

    const existingPanel = await this.findById(id);
    if (!existingPanel) {
      throw new Error("Panel no encontrado");
    }

    // No debemos sobrescribir createdAt en la actualización.
    const rawUpdate: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    const updateData = this.mapPanelToDocument(rawUpdate);

    const docRef = doc(this.firestore, collectionPath, id);
    await updateDoc(docRef, updateData);

    // Leer documento actualizado y devolver la entidad actualizada
    const updatedSnap = await getDoc(docRef);
    if (!updatedSnap.exists()) {
      throw new Error("Error al leer el panel actualizado");
    }
    return this.mapDocumentToPanel(updatedSnap.id, updatedSnap.data());
  }

  // *D* = Eliminar
  async delete(id: string): Promise<void> {
    const collectionPath = this.getCollectionPath();

    const existingPanel = await this.findById(id);
    if (!existingPanel) {
      throw new Error("Panel no encontrado");
    }

    const docRef = doc(this.firestore, collectionPath, id);
    await deleteDoc(docRef);

    // TODO: Aquí deberías manejar qué hacer con las tareas/eventos/exámenes del panel
    // Opciones: moverlos a otro panel, eliminarlos, etc.
  }

  async reorder(panelIds: string[]): Promise<void> {
    const collectionPath = this.getCollectionPath();

    const batch = writeBatch(this.firestore);

    panelIds.forEach((panelId, index) => {
      const docRef = doc(this.firestore, collectionPath, panelId);
      batch.update(docRef, {
        order: index,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });

    await batch.commit();
  }

  async getStats(panelId: string): Promise<Panel["stats"]> {
    const { userId, accountType } = this.getContext().state.user;
    const basePath = accountType === "guests" ? "guests" : "users";

    // Contar tareas
    const tasksQuery = query(
      collection(this.firestore, `${basePath}/${userId}/tasks`),
      where("panelId", "==", panelId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const totalTasks = tasksSnapshot.size;
    const completedTasks = tasksSnapshot.docs.filter(
      (docSnap) => !!docSnap.data().completed === true
    ).length;

    // Contar eventos
    const eventsQuery = query(
      collection(this.firestore, `${basePath}/${userId}/events`),
      where("panelId", "==", panelId)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    const totalEvents = eventsSnapshot.size;

    // Contar exámenes
    const examsQuery = query(
      collection(this.firestore, `${basePath}/${userId}/exams`),
      where("panelId", "==", panelId)
    );
    const examsSnapshot = await getDocs(examsQuery);
    const totalExams = examsSnapshot.size;

    const now = new Date();
    const upcomingExams = examsSnapshot.docs.filter((docSnap) => {
      const examDateField = docSnap.data().examDate;
      const examDate =
        examDateField instanceof Timestamp
          ? examDateField.toDate()
          : examDateField instanceof Date
          ? examDateField
          : null;
      return examDate ? examDate > now : false;
    }).length;

    return {
      totalTasks,
      completedTasks,
      totalEvents,
      totalExams,
      upcomingExams,
    };
  }
}
