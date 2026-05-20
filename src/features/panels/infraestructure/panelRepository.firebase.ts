import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  Timestamp,
  type DocumentData,
  DocumentReference,
  Firestore,
  writeBatch,
  arrayUnion,
  where,
} from "firebase/firestore";
import type { PanelRepository } from "../app/panelsRepository.interface";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import type { User } from "#core/auth/domain/user.entity";

export class FirebasePanelsRepository implements PanelRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentUser: () => User | undefined,
  ) {}

  private getCollectionPath(): string {
    const { accountType, id } = this.getUser();
    return `${accountType}/${id}/panels`;
  }

  private getUser(): User {
    const ctx = this.getCurrentUser();
    if (!ctx) {
      throw new Error("panelUserContext no disponible");
    }
    return ctx;
  }

  private setPanelDefault(): CreatePanelDTO {
    const defaultPanel: CreatePanelDTO = {
      name: "home",
      color: 0,
      icon: "",
      isDefault: true,
      subPanelsId: [],
      sharedWith: "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    return defaultPanel;
  }

  /**
   * Convierte un DocumentData (con Timestamp) a la entidad Panel.
   * Se devuelve createdAt/updatedAt como Date | undefined y se incluye id.
   */
  private mapDocumentToPanel(id: string, data: DocumentData): Panel {
    return {
      id,
      parentId: data.parentId || "root",
      name: data.name,
      icon: data.icon,
      color: data.color,
      isDefault: !!data.isDefault,
      subPanelsId: data.subPanelsId,
      sharedWith: data.sharedWith ?? "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Convierte una entidad Panel (o DTO parcial) a DocumentData para Firestore.
   * Soporta createdAt/updatedAt como Date o Timestamp. Elimina campos locales no persistibles.
   */
  private mapPanelToDocument(
    panel: Partial<Panel> | Partial<CreatePanelDTO>,
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

    console.log("Panel data:", data);

    return data as DocumentData;
  }

  // *C* = Crear
  async create(data: CreatePanelDTO, parentId: string): Promise<Panel> {
    const collectionPath = this.getCollectionPath();

    const parentRef = doc(this.firestore, collectionPath, parentId);
    const parentSnap = await getDoc(parentRef);
    if (!parentSnap.exists()) {
      throw new Error(`Panel padre con id "${parentId}" no encontrado`);
    }

    const childRef = doc(collection(this.firestore, collectionPath));
    if (data.createdAt == undefined || data.updatedAt == undefined) {
      data = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
    }

    const panelDoc = this.mapPanelToDocument(data);
    const batch = writeBatch(this.firestore);

    batch.set(childRef, panelDoc);

    batch.update(parentRef, {
      // CAMBIO: Guardamos 'childRef' (DocumentReference) en lugar de 'childRef.id'
      subPanelsId: arrayUnion(childRef),
      updatedAt: Timestamp.now(),
    });

    await batch.commit();

    const createdSnap = await getDoc(childRef);
    if (!createdSnap.exists()) {
      throw new Error("No se pudo recuperar el panel recién creado");
    }
    return this.mapDocumentToPanel(createdSnap.id, createdSnap.data()!);
  }

  async addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<boolean | Error> {
    try {
      await updateDoc(parentRef, {
        subPanelsId: arrayUnion(childRef),
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      return Error("Error al añadir el subPanel al padre");
    }
  }

  // *R* = Leer
  async findHomePanel(): Promise<Panel> {
    const colPath = this.getCollectionPath();
    const q = query(
      collection(this.firestore, colPath),
      where("isDefault", "==", true),
    );

    console.log("findHomePanel - q: ", q);

    const querySnapshot = await getDocs(q);

    console.log("findHomePanel - querySnapshot: ", querySnapshot);

    if (querySnapshot.empty) {
      console.info("No tienes nada, pero se está creando uno por defecto");
      return this.create(this.setPanelDefault(), "root");
    }

    if (querySnapshot.size > 1) {
      console.warn(
        `Se encontraron ${querySnapshot.size} paneles por defecto. Debería haber solo uno. Devolviendo el primero encontrado.`,
      );
    }

    // TODO(Hacer dialog para decidir cual de ellos poner y el resto ponerlos en false directamente)
    // devolver el primero (caso normal o con warning)
    return this.mapDocumentToPanel(
      querySnapshot.docs[0].id,
      querySnapshot.docs[0].data(),
    );
  }

  async findAll(): Promise<Panel[]> {
    const collectionPath = this.getCollectionPath();

    const q = query(collection(this.firestore, collectionPath));

    const querySnapshot = await getDocs(q);
    const panels = querySnapshot.docs.map((docSnap) =>
      this.mapDocumentToPanel(docSnap.id, docSnap.data()),
    );

    console.log("panels: ", panels);
    return panels;
  }

  async findById(id: string): Promise<Panel | undefined> {
    const collectionPath = this.getCollectionPath();

    const docRef = doc(this.firestore, collectionPath, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return undefined;
    }

    return this.mapDocumentToPanel(docSnap.id, docSnap.data());
  }

  async findByRef(ref: DocumentReference): Promise<Panel | undefined> {
    const collectionPath = this.getCollectionPath();

    const docRef = doc(this.firestore, collectionPath, ref.id);
    console.log("Ref:", ref, "ref:", ref.id, "docRef: ", docRef);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return this.mapDocumentToPanel(docSnap.id, docSnap.data());
    }

    return undefined;
  }

  async findDocRef(id: string): Promise<DocumentReference | Error> {
    try {
      const collectionPath = this.getCollectionPath();
      return doc(this.firestore, collectionPath, id);
    } catch (error) {
      return Error("No se pudo generar la referencia del documento");
    }
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
}
