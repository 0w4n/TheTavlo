import { DocumentReference, Firestore, type Unsubscribe } from "firebase/firestore";
import type { PanelRepository } from "../app/panelsRepository.interface";
import type { CreatePanelDTO, Panel, UpdatePanelDTO } from "../domain/panel.entity";
import type { User } from "#core/auth/domain/user.entity";
import { type ResultApp, type AppErr } from "#core/appCore/domain/AppCore.type";
export declare class FirebasePanelsRepository implements PanelRepository {
    private firestore;
    private getCurrentUser;
    constructor(firestore: Firestore, getCurrentUser: () => User);
    private getCollectionPath;
    private getUser;
    private collectionRef;
    private docRef;
    private setPanelDefault;
    /**
     * Escucha el panel "home" en tiempo real.
     * Si no existe aún, lo crea y el listener se dispara automáticamente
     * con el nuevo documento.
     */
    subscribeToHomePanel(onData: (panel: Panel) => void, onError: (err: AppErr) => void): Unsubscribe;
    /**
     * Escucha todos los paneles del usuario en tiempo real.
     */
    subscribeToAll(onData: (panels: Panel[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    findHomePanel(): Promise<ResultApp<Panel, AppErr>>;
    findAll(): Promise<ResultApp<Panel[], AppErr>>;
    findByParentId(parentId: DocumentReference): Promise<ResultApp<Panel[], AppErr>>;
    findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>>;
    /**
     * Trae varios paneles por id en el menor número de queries posible, en
     * vez de un `findById` por cada uno. Firestore limita el operador `in` a
     * 10 valores por query, así que agrupamos en chunks de a 10 y los
     * disparamos todos en paralelo.
     */
    findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>>;
    findByRef(ref: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>>;
    findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>>;
    findBySharedId(sharedId: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>>;
    findArchived(parentId: DocumentReference): Promise<ResultApp<Panel[] | undefined, AppErr>>;
    create(data: CreatePanelDTO, parentId?: DocumentReference): Promise<ResultApp<Panel, AppErr>>;
    addSubPanel(parentRef: DocumentReference, _childRef: DocumentReference): Promise<ResultApp<void, AppErr>>;
    archive(id: string): Promise<ResultApp<Panel, AppErr>>;
    unarchive(id: string): Promise<ResultApp<Panel, AppErr>>;
    update(id: string, data: UpdatePanelDTO): Promise<ResultApp<Panel, AppErr>>;
    delete(id: string): Promise<ResultApp<void, AppErr>>;
    /**
     * BFS contra Firestore (no contra la caché local) para encontrar TODOS los
     * descendientes de `rootId`, a cualquier profundidad. Ir directo a la
     * fuente acá es intencional: la caché puede no tener cargada una rama
     * entera del árbol que igual hay que borrar.
     */
    private collectDescendantIds;
    deleteCascade(id: string): Promise<ResultApp<{
        deletedIds: string[];
    }, AppErr>>;
    deleteArchived(ref: DocumentReference): Promise<ResultApp<Panel[], AppErr>>;
}
