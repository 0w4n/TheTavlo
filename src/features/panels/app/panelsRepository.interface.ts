import type { DocumentReference } from "firebase/firestore";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import type { ResultApp, AppErr } from "#core/appCore/domain/AppCore.type";

export interface PanelRepository {
  /** Devuelve todos los paneles del usuario. */
  findAll(): Promise<ResultApp<Panel[], AppErr>>;

  /** Devuelve el panel marcado como home. */
  findHomePanel(): Promise<ResultApp<Panel, AppErr>>;

  /** Busca por id. Ok(undefined) si no existe, Err si falla la consulta. */
  findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>>;

  /** Busca por DocumentReference. */
  findByRef(
    ref: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>>;

  /** Busca por referencia de panel compartido. */
  findBySharedId(
    sharedId: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>>;

  /** Devuelve todos los paneles hijos de un panel padre por su id. */
  findByParentId(parentId: DocumentReference): Promise<ResultApp<Panel[], AppErr>>;

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
}
