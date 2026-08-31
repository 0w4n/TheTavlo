import { type Panel } from "../../domain/panel.entity";
import type { AppErr } from "#core/appCore/domain/AppCore.type";
/**
 * @param selectedPanel El panel que se encuentra seleccionado
 * @param currentPanel Panel en el que te encuentres
 * @param subPanels Hijos directos de currentPanel. Se recargan desde
 * Firestore únicamente cuando cambia currentPanel.id (ver el efecto en
 * `panelsContext.tsx`); las mutaciones (crear/editar/borrar) lo actualizan
 * en memoria en este reducer, sin volver a leer de Firestore.
 */
export type PanelsState = {
    status: "loading";
} | {
    status: "panel";
    selectedPanel?: Panel;
    currentPanel: Panel;
    subPanels: Panel[];
} | {
    status: "error";
    error?: AppErr;
};
type PanelsAction = {
    type: "FETCH_PANELS_START";
} | {
    type: "FETCH_PANELS_SUCCESS";
    payload: Panel[];
} | {
    type: "FETCH_PANELS_ERROR";
    payload: AppErr;
} | {
    type: "FETCH_SUBPANELS_SUCCESS";
    payload: {
        parentId: string;
        panels: Panel[];
    };
} | {
    type: "FETCH_SUBPANELS_ERROR";
    payload: AppErr;
} | {
    type: "FETCH_ARCHIVED_SUCCESS";
    payload: {
        parentId: string;
        panels: Panel[];
    };
} | {
    type: "FETCH_ARCHIVED_ERROR";
    payload: AppErr;
} | {
    type: "CREATE_PANEL_SUCCESS";
    payload: Panel;
} | {
    type: "ARCHIVED";
    payload: Panel;
} | {
    type: "ARCHIVED_ERROR";
    payload: AppErr;
} | {
    type: "UNARCHIVED";
    payload: Panel;
} | {
    type: "UNARCHIVED_ERROR";
    payload: AppErr;
} | {
    type: "UPDATE_PANEL_SUCCESS";
    payload: Panel;
} | {
    type: "DELETE_PANEL_SUCCESS";
    payload: string;
} | {
    type: "DELETE_PANEL_CASCADE_SUCCESS";
    payload: {
        deletedIds: string[];
    };
} | {
    type: "DELETE_ARCHIVED_SUCCESS";
    payload: Panel[];
} | {
    type: "DELETE_ARCHIVED_ERROR";
    payload: AppErr;
} | {
    type: "SELECT_PANEL";
    payload: Panel;
} | {
    type: "CLEAR_ERROR";
};
export declare const initialPanelsState: PanelsState;
export declare function panelsReducer(state: PanelsState, action: PanelsAction): PanelsState;
export {};
