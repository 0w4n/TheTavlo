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
  onSnapshot,
  documentId,
  type Unsubscribe,
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
    private getCurrentUser: () => User,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private getCollectionPath(): string {
    const { accountType, id } = this.getUser();
    return `${accountType}/${id}/panels`;
  }

  private getUser(): User {
    const ctx = this.getCurrentUser();
    if (!ctx) throw new Error("panelUserContext no disponible");
    return ctx;
  }

  private setPanelDefault(): CreatePanelDTO {
    const now = Timestamp.now();
    return {
      parentId: null,
      name: "",
      color: -1,
      icon: "",
      sharedWith: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  private mapDocumentToPanel(
    id: string,
    data: DocumentData,
    owner?: { ownerId: string; ownerAccountType: User["accountType"] },
  ): Panel {
    return {
      id,
      parentId: data.parentId ?? null,
      name: data.name,
      icon: data.icon,
      color: data.color,
      sharedWith: data.sharedWith ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      ownerId: owner?.ownerId,
      ownerAccountType: owner?.ownerAccountType,
    };
  }

  /**
   * Deriva el propietario real de un panel a partir de la ruta completa de
   * su documento, ej. "users/abc123/panels/xyz" -> { ownerAccountType: "users", ownerId: "abc123" }.
   * Funciona tanto para paneles propios como para paneles de otra persona
   * encontrados vía findBySharedId/findByRef (collectionGroup).
   */
  private ownerFromPath(path: string): {
    ownerId: string;
    ownerAccountType: User["accountType"];
  } {
    const [ownerAccountType, ownerId] = path.split("/");
    return {
      ownerId,
      ownerAccountType: ownerAccountType as User["accountType"],
    };
  }

  private mapPanelToDocument(
    panel: Partial<Panel> | Partial<CreatePanelDTO>,
  ): DocumentData {
    const data: any = { ...panel };
    if (data.createdAt instanceof Date)
      data.createdAt = Timestamp.fromDate(data.createdAt);
    if (data.updatedAt instanceof Date)
      data.updatedAt = Timestamp.fromDate(data.updatedAt);
    delete data.id;
    return data as DocumentData;
  }

  // ─── Suscripciones en tiempo real ────────────────────────────────────────

  /**
   * Escucha el panel "home" en tiempo real.
   * Si no existe aún, lo crea y el listener se dispara automáticamente
   * con el nuevo documento.
   */
  subscribeToHomePanel(
    onData: (panel: Panel) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    const { accountType, id } = this.getUser();
    if (accountType === null || id === null)
      console.log("Hola, aquí está el error");
    const q = query(
      collection(this.firestore, accountType, id, "panels"),
      where("color", "==", -1),
      where("parentId", "==", null),
    );

    // Bandera para evitar creaciones paralelas si el listener dispara varias veces
    let creating = false;

    const onHomePanel = onSnapshot(
      q,
      snap => {
        console.log("Snap: ", snap);

        if (snap.empty === false) {
          // Panel encontrado — entregarlo y resetear bandera
          creating = false;

          console.log(
            "panelToDoc: ",
            this.mapDocumentToPanel(snap.docs[0].id, snap.docs[0].data(), {
              ownerId: id,
              ownerAccountType: accountType,
            }),
          );

          onData(
            this.mapDocumentToPanel(snap.docs[0].id, snap.docs[0].data(), {
              ownerId: id,
              ownerAccountType: accountType,
            }),
          );

          return;
        }

        // Panel no existe — crear por primera vez (solo una vez)
        if (!creating) {
          creating = true;
          this.create(this.setPanelDefault()).then((result) => {
            if (!result.success) {
              creating = false;
              onError(result.err);
            }
            // Si tuvo éxito, el onSnapshot se dispara de nuevo con el nuevo doc
          });
        }
      },
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );

    return onHomePanel;
  }

  /**
   * Escucha todos los paneles del usuario en tiempo real.
   */
  subscribeToAll(
    onData: (panels: Panel[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    const { accountType, id } = this.getUser();
    const q = query(collection(this.firestore, this.getCollectionPath()));

    return onSnapshot(
      q,
      (snap) => {
        const panels = snap.docs.map((d) =>
          this.mapDocumentToPanel(d.id, d.data(), {
            ownerId: id,
            ownerAccountType: accountType,
          }),
        );
        onData(panels);
      },
      (error) => onError(firebaseErr(error.message)),
    );
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

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
      return this.create(this.setPanelDefault());
    }

    return ok(
      this.mapDocumentToPanel(
        querySnapshot.docs[0].id,
        querySnapshot.docs[0].data(),
        { ownerId: id, ownerAccountType: accountType },
      ),
    );
  }

  async findAll(): Promise<ResultApp<Panel[], AppErr>> {
    const { accountType, id } = this.getUser();
    const q = query(collection(this.firestore, this.getCollectionPath()));
    const querySnapshot = await getDocs(q);
    return ok(
      querySnapshot.docs.map((d) =>
        this.mapDocumentToPanel(d.id, d.data(), {
          ownerId: id,
          ownerAccountType: accountType,
        }),
      ),
    );
  }

  async findByParentId(
    parentId: DocumentReference,
  ): Promise<ResultApp<Panel[], AppErr>> {
    const { accountType, id } = this.getUser();
    const q = query(
      collection(this.firestore, this.getCollectionPath()),
      where("parentId", "==", parentId),
    );
    const querySnapshot = await getDocs(q);
    return ok(
      querySnapshot.docs.map((d) =>
        this.mapDocumentToPanel(d.id, d.data(), {
          ownerId: id,
          ownerAccountType: accountType,
        }),
      ),
    );
  }

  async findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>> {
    const { accountType, id: ownerId } = this.getUser();
    const docRef = doc(this.firestore, this.getCollectionPath(), id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return ok(undefined);
    return ok(
      this.mapDocumentToPanel(docSnap.id, docSnap.data(), {
        ownerId,
        ownerAccountType: accountType,
      }),
    );
  }

  /**
   * Trae varios paneles por id en el menor número de queries posible, en
   * vez de un `findById` por cada uno. Firestore limita el operador `in` a
   * 10 valores por query, así que agrupamos en chunks de a 10 y los
   * disparamos todos en paralelo.
   */
  async findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>> {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return ok([]);

    const { accountType, id: ownerId } = this.getUser();
    const collectionPath = this.getCollectionPath();
    const FIRESTORE_IN_LIMIT = 10;

    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += FIRESTORE_IN_LIMIT) {
      chunks.push(uniqueIds.slice(i, i + FIRESTORE_IN_LIMIT));
    }

    try {
      const snapshots = await Promise.all(
        chunks.map((chunk) =>
          getDocs(
            query(
              collection(this.firestore, collectionPath),
              where(documentId(), "in", chunk),
            ),
          ),
        ),
      );

      const panels = snapshots.flatMap((snap) =>
        snap.docs.map((d) =>
          this.mapDocumentToPanel(d.id, d.data(), {
            ownerId,
            ownerAccountType: accountType,
          }),
        ),
      );

      return ok(panels);
    } catch (error) {
      return err(
        firebaseErr(
          error instanceof Error ? error.message : "Error al leer paneles por id",
          undefined,
          error instanceof Error ? error.stack : undefined,
        ),
      );
    }
  }

  async findByRef(
    ref: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    const docSnap = await getDoc(ref);
    if (docSnap.exists())
      return ok(
        this.mapDocumentToPanel(
          docSnap.id,
          docSnap.data(),
          this.ownerFromPath(docSnap.ref.path),
        ),
      );
    return err(firebaseErr("Panel no encontrado"));
  }

  async findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>> {
    try {
      return ok(doc(this.firestore, this.getCollectionPath(), id));
    } catch {
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
    if (querySnapshot.empty) return ok(undefined);
    const docSnap = querySnapshot.docs[0];
    return ok(
      this.mapDocumentToPanel(
        docSnap.id,
        docSnap.data(),
        this.ownerFromPath(docSnap.ref.path),
      ),
    );
  }

  // ─── Mutaciones — sin getDoc extra post-escritura ─────────────────────────

  async create(
    data: CreatePanelDTO,
    parentId?: DocumentReference,
  ): Promise<ResultApp<Panel, AppErr>> {
    const { accountType, id: ownerId } = this.getUser();
    const collectionPath = this.getCollectionPath();
    const ref = doc(collection(this.firestore, collectionPath));
    const batch = writeBatch(this.firestore);
    const now = Timestamp.now();

    const panelData = this.mapPanelToDocument({
      ...data,
      parentId: parentId ?? undefined,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });

    batch.set(ref, panelData);
    await batch.commit();

    // Construimos el panel localmente para evitar el getDoc extra
    return ok(
      this.mapDocumentToPanel(
        ref.id,
        {
          ...panelData,
          parentId: parentId ?? null,
        },
        { ownerId, ownerAccountType: accountType },
      ),
    );
  }

  async addSubPanel(
    parentRef: DocumentReference,
    _childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>> {
    try {
      await updateDoc(parentRef, { updatedAt: Timestamp.now() });
      return ok(undefined);
    } catch {
      return err(firebaseErr("Error al actualizar el panel padre"));
    }
  }

  async update(
    id: string,
    data: UpdatePanelDTO,
  ): Promise<ResultApp<Panel, AppErr>> {
    const { accountType, id: ownerId } = this.getUser();
    const collectionPath = this.getCollectionPath();

    const rawUpdate = { ...data, updatedAt: Timestamp.now() };
    const updateData = this.mapPanelToDocument(rawUpdate);

    const docRef = doc(this.firestore, collectionPath, id);
    await updateDoc(docRef, updateData);

    // Leemos solo para devolver el panel actualizado (requerido por el tipo)
    const updatedSnap = await getDoc(docRef);
    if (!updatedSnap.exists())
      return err(firebaseErr("Error al leer el panel actualizado"));
    return ok(
      this.mapDocumentToPanel(updatedSnap.id, updatedSnap.data(), {
        ownerId,
        ownerAccountType: accountType,
      }),
    );
  }

  async delete(id: string): Promise<ResultApp<void, AppErr>> {
    const docRef = doc(this.firestore, this.getCollectionPath(), id);
    await deleteDoc(docRef);
    return ok(undefined);
  }

  /**
   * BFS contra Firestore (no contra la caché local) para encontrar TODOS los
   * descendientes de `rootId`, a cualquier profundidad. Ir directo a la
   * fuente acá es intencional: la caché puede no tener cargada una rama
   * entera del árbol que igual hay que borrar.
   */
  private async collectDescendantIds(rootId: string): Promise<string[]> {
    const collectionPath = this.getCollectionPath();
    const descendantIds: string[] = [];
    const queue: string[] = [rootId];

    while (queue.length > 0) {
      const currentId = queue.shift() as string;
      const parentRef = doc(this.firestore, collectionPath, currentId);
      const childrenQuery = query(
        collection(this.firestore, collectionPath),
        where("parentId", "==", parentRef),
      );
      const snap = await getDocs(childrenQuery);

      for (const childDoc of snap.docs) {
        descendantIds.push(childDoc.id);
        queue.push(childDoc.id);
      }
    }

    return descendantIds;
  }

  async deleteCascade(
    id: string,
  ): Promise<ResultApp<{ deletedIds: string[] }, AppErr>> {
    const FIRESTORE_BATCH_LIMIT = 500;
    const collectionPath = this.getCollectionPath();

    try {
      const descendantIds = await this.collectDescendantIds(id);
      const deletedIds = [id, ...descendantIds];

      // Firestore permite un máximo de 500 operaciones por batch — si el
      // subárbol es más grande, lo segmentamos en varios batches. Cada
      // batch sigue siendo atómico en sí mismo; entre batches no hay
      // rollback cruzado, que es la mejor garantía disponible arriba del
      // límite duro de la API.
      for (let i = 0; i < deletedIds.length; i += FIRESTORE_BATCH_LIMIT) {
        const chunk = deletedIds.slice(i, i + FIRESTORE_BATCH_LIMIT);
        const batch = writeBatch(this.firestore);
        for (const panelId of chunk) {
          batch.delete(doc(this.firestore, collectionPath, panelId));
        }
        await batch.commit();
      }

      return ok({ deletedIds });
    } catch (error) {
      return err(
        firebaseErr(
          error instanceof Error
            ? error.message
            : "Error al eliminar el panel y sus descendientes",
          undefined,
          error instanceof Error ? error.stack : undefined,
        ),
      );
    }
  }
}
