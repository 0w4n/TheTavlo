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

  /** Obtiene la DocumentReference de un panel por su id. */
  findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>>;

  /** Crea un nuevo panel. */
  create(
    data: CreatePanelDTO,
    parentId: string,
  ): Promise<ResultApp<Panel, AppErr>>;

  /** Añade childRef al array subPanelsId de parentRef. */
  addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>>;

  /** Actualiza campos de un panel existente. */
  update(id: string, data: UpdatePanelDTO): Promise<ResultApp<Panel, AppErr>>;

  /** Elimina un panel por su id. */
  delete(id: string): Promise<ResultApp<void, AppErr>>;
}
