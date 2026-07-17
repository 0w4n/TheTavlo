import type { DocumentReference, Unsubscribe } from "firebase/firestore";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import type { ResultApp, AppErr } from "#core/appCore/domain/AppCore.type";

export interface PanelRepository {
  subscribeToHomePanel(
    onData: (panel: Panel) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  subscribeToAll(
    onData: (panels: Panel[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  /** Devuelve todos los paneles del usuario. */
  findAll(): Promise<ResultApp<Panel[], AppErr>>;

  /** Devuelve el panel marcado como home. */
  findHomePanel(): Promise<ResultApp<Panel, AppErr>>;

  /** Busca por id. Ok(undefined) si no existe, Err si falla la consulta. */
  findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>>;

  /**
   * Busca varios paneles por id de una sola vez (implementaciones remotas
   * deberían agruparlas en queries por lote en lugar de N lecturas
   * individuales). Ids inexistentes simplemente se omiten del resultado —
   * nunca es un error pedir un id que no está.
   */
  findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>>;

  /** Busca por DocumentReference. */
  findByRef(
    ref: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>>;

  /** Busca por referencia de panel compartido. */
  findBySharedId(
    sharedId: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>>;

  /** Devuelve todos los paneles hijos de un panel padre por su id. */
  findByParentId(
    parentId: DocumentReference,
  ): Promise<ResultApp<Panel[], AppErr>>;

  /** Obtiene la DocumentReference de un panel por su id. */
  findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>>;

  /**
   * Crea un nuevo panel.
   * @param parentId Si se proporciona, el nuevo panel queda como hijo de ese panel.
   */
  create(
    data: CreatePanelDTO,
    parentId?: DocumentReference,
  ): Promise<ResultApp<Panel, AppErr>>;

  /** @deprecated Usar parentId en create() en su lugar. */
  addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>>;

  /** Actualiza campos de un panel existente. */
  update(id: string, data: UpdatePanelDTO): Promise<ResultApp<Panel, AppErr>>;

  /** Elimina un panel por su id. */
  delete(id: string): Promise<ResultApp<void, AppErr>>;

  /**
   * Elimina un panel y TODOS sus descendientes (a cualquier profundidad) de
   * forma atómica por lote. Busca los descendientes directamente contra la
   * fuente (nunca solo contra la caché local) para garantizar que se
   * capturen también los que no estén cargados en memoria todavía.
   * Devuelve la lista completa de ids eliminados (incluido el propio `id`).
   */
  deleteCascade(id: string): Promise<ResultApp<{ deletedIds: string[] }, AppErr>>;
}
