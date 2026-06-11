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
      parentId: null,
      name: "",
      color: -1,
      icon: "",
      sharedWith: null,
      createdAt: now,
      updatedAt: now,
    };

    return defaultPanel;
  }

  /**
   * Convierte un DocumentData (con Timestamp) a la entidad Panel.
   */
  private mapDocumentToPanel(id: string, data: DocumentData): Panel {
    return {
      id,
      parentId: data.parentId ?? null,
      name: data.name,
      icon: data.icon,
      color: data.color,
      sharedWith: data.sharedWith ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Convierte una entidad Panel (o DTO parcial) a DocumentData para Firestore.
   */
  private mapPanelToDocument(
    panel: Partial<Panel> | Partial<CreatePanelDTO>,
  ): DocumentData {
    const data: any = { ...panel };

    if (data.createdAt) {
      if (data.createdAt instanceof Date) {
        data.createdAt = Timestamp.fromDate(data.createdAt);
      }
    } else {
      delete data.createdAt;
    }

    if (data.updatedAt) {
      if (data.updatedAt instanceof Date) {
        data.updatedAt = Timestamp.fromDate(data.updatedAt);
      }
    } else {
      delete data.updatedAt;
    }

    // Limpiar campos que no pertenecen al documento
    delete data.id;

    return data as DocumentData;
  }

  // *C* = Crear
  async create(
    data: CreatePanelDTO,
    parentId?: DocumentReference,
  ): Promise<ResultApp<Panel, AppErr>> {
    const collectionPath = this.getCollectionPath();
    const ref = doc(collection(this.firestore, collectionPath));
    const batch = writeBatch(this.firestore);
    const now = Timestamp.now();

    if (data.createdAt == undefined || data.updatedAt == undefined) {
      data = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
    }

    // Adjuntar parentId al documento que se va a guardar
    const panelDoc = this.mapPanelToDocument({
      ...data,
      parentId: parentId ?? undefined,
    });

    batch.set(ref, panelDoc);

    await batch.commit();

    const createdSnap = await getDoc(ref);
    if (!createdSnap.exists()) {
      throw new Error("No se pudo recuperar el panel recién creado");
    }

    return ok(this.mapDocumentToPanel(createdSnap.id, createdSnap.data()!));
  }

  async addSubPanel(
    parentRef: DocumentReference,
    _childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>> {
    // Kept for backwards compat — no longer used in the main flow.
    // Sub-panels are now linked via the parentId field on the child document.
    try {
      await updateDoc(parentRef, {
        updatedAt: Timestamp.now(),
      });
      return ok(undefined);
    } catch (error) {
      return err(firebaseErr("Error al actualizar el panel padre"));
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

    const querySnapshot = await getDocs(q);

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

  /**
   * Devuelve todos los paneles cuyo parentId coincide con el id dado.
   */
  async findByParentId(parentId: DocumentReference): Promise<ResultApp<Panel[], AppErr>> {
    const collectionPath = this.getCollectionPath();

    const q = query(
      collection(this.firestore, collectionPath),
      where("parentId", "==", parentId),
    );

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

    const querySnapshot = await getDocs(q);

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

    const rawUpdate: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    const updateData = this.mapPanelToDocument(rawUpdate);

    const docRef = doc(this.firestore, collectionPath, id);
    await updateDoc(docRef, updateData);

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

    return ok(undefined);
  }
}
