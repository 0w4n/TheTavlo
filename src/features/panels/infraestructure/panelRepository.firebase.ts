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
  collectionGroup,
} from "firebase/firestore";
import type { PanelRepository } from "../app/panelsRepository.interface";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import type { User } from "#core/auth/domain/user.entity";
import {
  err,
  ok,
  type ResultApp,
  type AppErr,
  firebaseErr,
} from "#core/appCore/domain/AppCore.type";

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
    const now = Timestamp.now();
    const defaultPanel: CreatePanelDTO = {
      name: "",
      color: -1,
      icon: "",
      subPanelsId: [],
      sharedWith: undefined,
      createdAt: now,
      updatedAt: now,
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
      parentId: data.parentId ?? undefined,
      name: data.name,
      icon: data.icon,
      color: data.color,
      subPanelsId: data.subPanelsId,
      sharedWith: data.sharedWith ?? undefined,
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

    return data as DocumentData;
  }

  // *C* = Crear
  async create(
    data: CreatePanelDTO,
    parentId?: string,
  ): Promise<ResultApp<Panel, AppErr>> {
    const collectionPath = this.getCollectionPath();
    const ref = doc(collection(this.firestore, collectionPath));
    const batch = writeBatch(this.firestore);
    const panelDoc = this.mapPanelToDocument(data);
    const now = Timestamp.now();

    if (data.createdAt == undefined || data.updatedAt == undefined) {
      data = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
    }

    if (parentId === undefined) {
      batch.set(ref, panelDoc);
    } else {
      const parentRef = doc(this.firestore, collectionPath, parentId);
      const parentSnap = await getDoc(parentRef);
      if (!parentSnap.exists()) {
        throw new Error(`Panel padre con id "${parentId}" no encontrado`);
      }

      console.log(panelDoc);

      batch.set(ref, panelDoc);

      batch.update(parentRef, {
        subPanelsId: arrayUnion(ref),
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();

    const createdSnap = await getDoc(ref);
    if (!createdSnap.exists()) {
      throw new Error("No se pudo recuperar el panel recién creado");
    }

    return ok(this.mapDocumentToPanel(createdSnap.id, createdSnap.data()!));
  }

  async addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>> {
    try {
      await updateDoc(parentRef, {
        subPanelsId: arrayUnion(childRef),
        updatedAt: Timestamp.now(),
      });
      return ok(undefined);
    } catch (error) {
      return err(firebaseErr("Error al añadir el subPanel al padre"));
    }
  }

  // *R* = Leer
  async findHomePanel(): Promise<ResultApp<Panel, AppErr>> {
    const { accountType, id } = this.getUser();

    const q = query(
      collection(this.firestore, accountType, id, "panels"),
      where("color", "==", -1),
      where("icon", "==", ""),
      where("name", "==", ""),
      where("sharedWith", "==", null),
    );

    console.log("Query para panel por defecto: ", q);

    const querySnapshot = await getDocs(q);

    console.log(
      "QuerySnapshot obtenido para panel por defecto:",
      querySnapshot,
    );

    if (querySnapshot.empty) {
      const def = await this.create(this.setPanelDefault());

      if (def.success) {
        return ok(def.value);
      } else {
        return err(def.err);
      }
    }

    if (querySnapshot.size > 1) {
      console.warn(
        `Se encontraron ${querySnapshot.size} paneles por defecto. Debería haber solo uno. Devolviendo el primero encontrado.`,
      );
    }

    return ok(
      this.mapDocumentToPanel(
        querySnapshot.docs[0].id,
        querySnapshot.docs[0].data(),
      ),
    );
  }

  async findAll(): Promise<ResultApp<Panel[], AppErr>> {
    const collectionPath = this.getCollectionPath();

    const q = query(collection(this.firestore, collectionPath));

    const querySnapshot = await getDocs(q);
    const panels = querySnapshot.docs.map((docSnap) =>
      this.mapDocumentToPanel(docSnap.id, docSnap.data()),
    );

    return ok(panels);
  }

  async findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>> {
    const collectionPath = this.getCollectionPath();

    const docRef = doc(this.firestore, collectionPath, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return ok(undefined);
    }

    return ok(this.mapDocumentToPanel(docSnap.id, docSnap.data()));
  }

  async findByRef(ref: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>> {
    // Use the ref's own path directly — it may point to the user's "panels"
    // collection or to the global "shared" collection; either way the ref
    // already carries the correct Firestore path.
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      return ok(this.mapDocumentToPanel(docSnap.id, docSnap.data()));
    }

    return err(firebaseErr("Panel no encontrado"));
  }

  async findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>> {
    try {
      const collectionPath = this.getCollectionPath();
      return ok(doc(this.firestore, collectionPath, id));
    } catch (error) {
      return err(firebaseErr("No se pudo generar la referencia del documento"));
    }
  }

  async findBySharedId(
    sharedId: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    const q = query(
      collectionGroup(this.firestore, "panels"),
      where("sharedWith", "==", sharedId.id),
    );
    console.log("Query: ", q);

    const querySnapshot = await getDocs(q);

    console.log("QuerySnapshot obtenido:", querySnapshot);

    if (querySnapshot.empty) {
      return ok(undefined);
    }
    return ok(this.mapDocumentToPanel(
      querySnapshot.docs[0].id,
      querySnapshot.docs[0].data(),
    ));
  }

  // *U* = Actualizar
  async update(id: string, data: UpdatePanelDTO): Promise<ResultApp<Panel, AppErr>> {
    const collectionPath = this.getCollectionPath();

    const existingPanel = await this.findById(id);
    if (!existingPanel) {
      return err(firebaseErr("Panel no encontrado"));
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
      return err(firebaseErr("Error al leer el panel actualizado"));
    }
    return ok(this.mapDocumentToPanel(updatedSnap.id, updatedSnap.data()));
  }

  // *D* = Eliminar
  async delete(id: string): Promise<ResultApp<void, AppErr>> {
    const collectionPath = this.getCollectionPath();

    const existingPanel = await this.findById(id);
    if (!existingPanel) {
      return err(firebaseErr("Panel no encontrado"));
    }

    const docRef = doc(this.firestore, collectionPath, id);
    await deleteDoc(docRef);

    // TODO: Aquí deberías manejar qué hacer con las tareas/eventos/exámenes del panel
    // Opciones: moverlos a otro panel, eliminarlos, etc.
    return ok(undefined);
  }
}
