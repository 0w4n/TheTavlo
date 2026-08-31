import type { DocumentReference, Unsubscribe } from "firebase/firestore";
import type { PanelRepository } from "../app/panelsRepository.interface";
import type { CreatePanelDTO, Panel, UpdatePanelDTO } from "../domain/panel.entity";
import type { AppErr, ResultApp } from "#core/appCore/domain/AppCore.type";
/**
 * Decorador de caché sobre cualquier `PanelRepository`. No sabe nada de
 * Firestore en particular — solo intercepta lecturas para servirlas desde
 * memoria cuando es posible, y mantiene la caché sincronizada en cada
 * escritura exitosa. Se puede envolver cualquier implementación (Firebase,
 * un fake de test, etc.) sin tocar una línea de este archivo.
 *
 * `cacheKey` identifica al usuario dueño de los paneles — ver
 * `getPanelsCacheKey`. Debe ser estable mientras dure la sesión y distinto
 * entre usuarios, para que la caché nunca filtre datos entre cuentas.
 */
export declare class CachedPanelsRepository implements PanelRepository {
    private readonly inner;
    private readonly cacheKey;
    constructor(inner: PanelRepository, cacheKey: string);
    subscribeToHomePanel(onData: (panel: Panel) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToAll(onData: (panels: Panel[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    findAll(): Promise<ResultApp<Panel[], AppErr>>;
    findHomePanel(): Promise<ResultApp<Panel, AppErr>>;
    findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>>;
    /**
     * Punto de entrada usado por `PanelsService.resolveChain` para validar la
     * cadena completa de la URL en una sola pasada: pide a la caché primero
     * (`ensurePanelsInCache`) y solo baja a Firestore los ids que falten.
     */
    findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>>;
    findByRef(ref: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>>;
    findBySharedId(sharedId: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>>;
    /**
     * Lista los hijos directos bajo demanda: si el padre ya fue consultado en
     * esta sesión (`loadedChildrenRegistry`), no vuelve a pegarle a Firestore.
     */
    findByParentId(parentId: DocumentReference): Promise<ResultApp<Panel[], AppErr>>;
    findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>>;
    create(data: CreatePanelDTO, parentId?: DocumentReference): Promise<ResultApp<Panel, AppErr>>;
    addSubPanel(parentRef: DocumentReference, childRef: DocumentReference): Promise<ResultApp<void, AppErr>>;
    update(id: string, data: UpdatePanelDTO): Promise<ResultApp<Panel, AppErr>>;
    delete(id: string): Promise<ResultApp<void, AppErr>>;
    deleteCascade(id: string): Promise<ResultApp<{
        deletedIds: string[];
    }, AppErr>>;
    findArchived(parentRef: DocumentReference): Promise<ResultApp<Panel[] | undefined, AppErr>>;
    archive(id: string): Promise<ResultApp<Panel, AppErr>>;
    unarchive(id: string): Promise<ResultApp<Panel, AppErr>>;
    deleteArchived(parentRef: DocumentReference): Promise<ResultApp<Panel[], AppErr>>;
}
