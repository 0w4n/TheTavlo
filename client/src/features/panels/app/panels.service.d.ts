import type { DocumentReference, Unsubscribe } from "firebase/firestore";
import type { CreatePanelDTO, Panel, UpdatePanelDTO } from "../domain/panel.entity";
import type { PanelRepository } from "./panelsRepository.interface";
import { type ResultApp, type AppErr } from "#core/appCore/domain/AppCore.type";
export declare class PanelsService {
    private repository;
    constructor(repository: PanelRepository);
    /**
     * Escucha el panel "home" en tiempo real.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribeToHomePanel(onData: (panel: Panel) => void, onError: (err: AppErr) => void): Unsubscribe;
    /**
     * Escucha todos los paneles del usuario en tiempo real.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribeToAll(onData: (panels: Panel[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    getAllPanels(): Promise<ResultApp<Panel[], AppErr>>;
    getHomePanel(): Promise<ResultApp<Panel, AppErr>>;
    getPanelById(id: string): Promise<ResultApp<Panel | undefined, AppErr>>;
    getPanelBySharedId(sharedId: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>>;
    getPanelByRef(ref: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>>;
    getDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>>;
    getSubPanels(parentId: DocumentReference): Promise<ResultApp<Panel[], AppErr>>;
    getArchivedPanels(parentRef: DocumentReference): Promise<ResultApp<Panel[] | undefined, AppErr>>;
    /**
     * Resuelve una cadena de ids de panel tal como viene en la URL
     * (`home/:pid/:pid/:pid`) contra la base de datos, validando que cada
     * panel esté efectivamente anidado dentro del anterior. La URL nunca es
     * una fuente de verdad por sí sola: alguien puede escribir a mano
     * `/home/idA/idB` sin que `idB` sea hijo real de `idA`.
     *
     * A diferencia de la versión anterior (un `findById` secuencial por cada
     * `:pid`), esto pide TODA la cadena de una sola vez con `findManyByIds` —
     * si el repositorio inyectado es un `CachedPanelsRepository`, eso significa
     * que solo se leen de Firestore los paneles que todavía no estén en
     * memoria (en el caso común de re-visitar una cadena ya conocida, cero
     * lecturas). La validación de jerarquía en sí (`validatePanelChain`) es
     * pura y no vuelve a tocar la fuente.
     *
     * Devuelve la cadena completa (del más externo al más anidado) en Ok, o
     * el primer error de jerarquía que encuentre en Err.
     */
    resolveChain(panelIds: string[]): Promise<ResultApp<Panel[], AppErr>>;
    createPanel(data: CreatePanelDTO, parentId?: DocumentReference): Promise<ResultApp<Panel, AppErr>>;
    /** @deprecated Usar parentId en createPanel() en su lugar. */
    addSubPanel(parentRef: DocumentReference, childRef: DocumentReference): Promise<ResultApp<void, AppErr>>;
    archivePanel(id: string): Promise<ResultApp<Panel, AppErr>>;
    unarchivePanel(id: string): Promise<ResultApp<Panel, AppErr>>;
    updatePanel(id: string, data: UpdatePanelDTO): Promise<ResultApp<Panel, AppErr>>;
    deletePanel(id: string): Promise<ResultApp<void, AppErr>>;
    /**
     * Elimina un panel y TODOS sus sub-paneles descendientes de forma atómica
     * (ver `FirebasePanelsRepository.deleteCascade`). Respeta la misma regla
     * que `deletePanel`: nunca se puede borrar el panel por defecto.
     */
    deletePanelCascade(id: string): Promise<ResultApp<{
        deletedIds: string[];
    }, AppErr>>;
    deletePanelArchive(id: DocumentReference): Promise<ResultApp<Panel[], AppErr>>;
}
