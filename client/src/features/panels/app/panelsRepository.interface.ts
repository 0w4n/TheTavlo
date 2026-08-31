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

  findAll(): Promise<ResultApp<Panel[], AppErr>>;
  findHomePanel(): Promise<ResultApp<Panel, AppErr>>;
  findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>>;
  findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>>;
  findByRef(
    ref: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>>;
  findBySharedId(
    sharedId: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>>;
  findByParentId(
    parentId: DocumentReference,
  ): Promise<ResultApp<Panel[], AppErr>>;
  findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>>;

  /**
   * Devuelve todos los paneles archivados.
   */
  findArchived(parentRef: DocumentReference | null): Promise<ResultApp<Panel[] | undefined, AppErr>>;

  create(
    data: CreatePanelDTO,
    parentId?: DocumentReference,
  ): Promise<ResultApp<Panel, AppErr>>;

  /** @deprecated Usar parentId en create() en su lugar. */
  addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>>;

  /**
   * Archiva un panel.
   */
  archive(id: string): Promise<ResultApp<void, AppErr>>;

  /**
   * Desarchiva un panel.
   */
  unarchive(id: string): Promise<ResultApp<void, AppErr>>;

  update(id: string, data: UpdatePanelDTO): Promise<ResultApp<Panel, AppErr>>;

  delete(id: string): Promise<ResultApp<void, AppErr>>;

  deleteCascade(
    id: string,
  ): Promise<ResultApp<{ deletedIds: string[] }, AppErr>>;

  /**
   * Elimina definitivamente un panel archivado.
   */
  deleteArchived(ref: DocumentReference): Promise<ResultApp<void, AppErr>>;
}
