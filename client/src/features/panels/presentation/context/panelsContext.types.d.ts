import { DocumentReference } from "firebase/firestore";
import type { CreatePanelDTO, Panel, UpdatePanelDTO } from "../../domain/panel.entity";
import type { PanelsState } from "./panelReducer";
import type { PropsWithChildren } from "react";
import type { PanelsService } from "#features/panels/app/panels.service";
import type { ResultApp, AppErr } from "#core/appCore/domain/AppCore.type";
export declare enum ReturnType {
    PANEL = "panel",
    DOCREF = "docRef",
    DEFAULT = "default"
}
export interface CreatePanelOpt {
    /** Qué tipo de valor debe retornar createPanel al llamador. */
    return: ReturnType;
    /** Si true, el nuevo panel se añade como sub-panel del currentPanel. */
    addToParent: boolean;
}
export type CreatePanelResult = ResultApp<void | Panel | DocumentReference, AppErr>;
export type PanelsContextValue = {
    state: PanelsState;
    /** Carga todos los paneles del usuario en el estado. */
    fetchPanels: () => Promise<void>;
    /** Carga y establece el panel home como currentPanel. */
    fetchHomePanel: () => Promise<void>;
    /** Busca un panel por DocumentReference (colección panels o shared). */
    findByRef: (ref: DocumentReference) => Promise<Panel | undefined>;
    /** Busca un panel a partir de su referencia de panel compartido. */
    findBySharedId: (sharedId: DocumentReference) => Promise<Panel | undefined>;
    findArchived: (parentRef: DocumentReference) => Promise<Panel[] | undefined>;
    /**
     * Crea un panel.
     * - Sin `opt`: crea en root, dispatch interno, retorna void.
     * - Con `opt.return = PANEL`: retorna el Panel creado.
     * - Con `opt.return = DOCREF`: retorna la DocumentReference del panel.
     * - Con `opt.addToParent = true`: usa el id del currentPanel como parentId.
     */
    createPanel: (data: CreatePanelDTO, opt?: CreatePanelOpt) => Promise<CreatePanelResult>;
    archivePanel: (id: string) => Promise<void>;
    unarchivePanel: (id: string) => Promise<void>;
    /** Actualiza campos de un panel por id. */
    updatePanel: (id: string, data: UpdatePanelDTO) => Promise<void>;
    /** Elimina un panel por id (respeta la regla isDefault). */
    deletePanel: (id: string) => Promise<void>;
    /**
     * Elimina un panel y TODOS sus sub-paneles descendientes de forma
     * atómica. Respeta la misma regla que `deletePanel`: nunca borra el panel
     * por defecto. Devuelve la lista de ids efectivamente eliminados.
     */
    deletePanelCascade: (id: string) => Promise<string[]>;
    deletePanelArchive: (id: DocumentReference) => Promise<ResultApp<Panel[], AppErr>>;
    /** Devuelve los paneles hijos del panel con el id dado. */
    fetchSubPanels: (parentId: DocumentReference | string) => Promise<void>;
    /** Establece el panel seleccionado (para edición/detalle). */
    selectPanel: (panel: Panel) => void;
    /** Limpia el error del estado. */
    clearError: () => void;
};
export type PanelsProviderProps = PropsWithChildren<{
    panelsService: PanelsService;
}>;
