import {} from "../../domain/panel.entity";
export const initialPanelsState = {
    status: "loading",
};
/**
 * Recalcula `subPanels` en memoria tras una mutación (crear/editar) que ya
 * devolvió el `Panel` completo, sin volver a consultar Firestore.
 *
 * Compara `mutated.parentId?.id` contra `currentPanelId` para decidir si el
 * panel mutado pertenece a la lista de hijos del panel activo:
 * - Si pertenece y no estaba: se agrega.
 * - Si pertenece y ya estaba (edición): se reemplaza in-place.
 * - Si no pertenece (o se reparentó a otro panel): se remueve si estaba.
 */
function reconcileSubPanels(subPanels, mutated, currentPanelId) {
    const belongsToCurrent = mutated.parentId?.id === currentPanelId;
    const existingIndex = subPanels.findIndex((p) => p.id === mutated.id);
    if (belongsToCurrent) {
        if (existingIndex === -1)
            return [...subPanels, mutated];
        const next = subPanels.slice();
        next[existingIndex] = mutated;
        return next;
    }
    if (existingIndex === -1)
        return subPanels;
    return subPanels.filter((p) => p.id !== mutated.id);
}
export function panelsReducer(state, action) {
    switch (action.type) {
        case "FETCH_PANELS_START":
            return {
                status: "loading",
            };
        case "FETCH_PANELS_SUCCESS": {
            const incoming = action.payload;
            const currentPanel = incoming[0];
            return {
                status: "panel",
                currentPanel,
                selectedPanel: undefined,
                // Se recarga vía el efecto de sincronización en cuanto cambie
                // currentPanel.id — ver panelsContext.tsx.
                subPanels: [],
            };
        }
        case "FETCH_PANELS_ERROR":
            return {
                status: "error",
                error: action.payload,
            };
        case "FETCH_SUBPANELS_SUCCESS": {
            if (state.status !== "panel")
                return state;
            // Descarta resultados obsoletos: el usuario pudo haber navegado a
            // otro panel mientras esta consulta estaba en vuelo. Es la misma red
            // de seguridad barata que usa la carga automática (con `cancelToken`)
            // y la vía legacy de `addSubPanel` (sin él).
            if (state.currentPanel.id !== action.payload.parentId)
                return state;
            return {
                ...state,
                subPanels: action.payload.panels,
            };
        }
        case "FETCH_SUBPANELS_ERROR":
            return {
                status: "error",
                error: action.payload,
            };
        case "FETCH_ARCHIVED_SUCCESS": {
            if (state.status !== "panel")
                return state;
            // Descarta resultados obsoletos: el usuario pudo haber navegado a
            // otro panel mientras esta consulta estaba en vuelo. Es la misma red
            // de seguridad barata que usa la carga automática (con `cancelToken`)
            // y la vía legacy de `addSubPanel` (sin él).
            if (state.currentPanel.id !== action.payload.parentId)
                return state;
            return {
                ...state,
                subPanels: action.payload.panels,
            };
        }
        case "FETCH_ARCHIVED_ERROR":
            return {
                status: "error",
                error: action.payload,
            };
        case "CREATE_PANEL_SUCCESS": {
            if (state.status !== "panel")
                return state;
            return {
                ...state,
                subPanels: reconcileSubPanels(state.subPanels, action.payload, state.currentPanel.id),
            };
        }
        case "ARCHIVED": {
            if (state.status !== "panel")
                return state;
            return {
                ...state,
                subPanels: reconcileSubPanels(state.subPanels, action.payload, state.currentPanel.id),
            };
        }
        case "ARCHIVED_ERROR":
            return {
                status: "error",
                error: action.payload,
            };
        case "UNARCHIVED": {
            return state;
        }
        case "UNARCHIVED_ERROR":
            return {
                status: "error",
                error: action.payload,
            };
        case "UPDATE_PANEL_SUCCESS": {
            if (state.status !== "panel")
                return state;
            const updated = action.payload;
            const currentPanel = state.currentPanel.id === updated.id ? updated : state.currentPanel;
            return {
                ...state,
                selectedPanel: state.selectedPanel?.id === updated.id
                    ? updated
                    : state.selectedPanel,
                currentPanel,
                subPanels: reconcileSubPanels(state.subPanels, updated, currentPanel.id),
            };
        }
        case "DELETE_PANEL_SUCCESS": {
            if (state.status !== "panel")
                return state;
            const deletedId = action.payload;
            // El panel borrado es el que estás viendo (o el seleccionado): no hay
            // forma segura de seguir mostrando este estado, hay que volver a
            // "loading" y dejar que la suscripción al panel home la repueble.
            if (state.currentPanel.id === deletedId ||
                state.selectedPanel?.id === deletedId) {
                return { status: "loading" };
            }
            // No era el panel activo: alcanza con sacarlo de subPanels en
            // memoria, sin recargar nada — cero lecturas extra a Firestore.
            return {
                ...state,
                subPanels: state.subPanels.filter((p) => p.id !== deletedId),
            };
        }
        case "DELETE_PANEL_CASCADE_SUCCESS": {
            // Mismo criterio que DELETE_PANEL_SUCCESS: cualquiera de los ids
            // borrados (el panel objetivo o alguno de sus descendientes) pudo ser
            // el currentPanel/selectedPanel — la forma segura de no dejar la UI
            // apuntando a un panel fantasma es volver a "loading" y dejar que la
            // suscripción al panel home la repueble. Si ninguno de los borrados
            // es el panel activo, se filtran en memoria de subPanels.
            if (state.status !== "panel")
                return state;
            const deletedIds = new Set(action.payload.deletedIds);
            if (deletedIds.has(state.currentPanel.id) ||
                (state.selectedPanel && deletedIds.has(state.selectedPanel.id))) {
                return { status: "loading" };
            }
            return {
                ...state,
                subPanels: state.subPanels.filter((p) => !deletedIds.has(p.id)),
            };
        }
        case "DELETE_ARCHIVED_SUCCESS": {
            if (state.status !== "panel")
                return state;
            const deletedPanels = action.payload;
            const deletedIds = new Set(deletedPanels.map((p) => p.id));
            // El panel borrado es el que estás viendo (o el seleccionado): no hay
            // forma segura de seguir mostrando este estado, hay que volver a
            // "loading" y dejar que la suscripción al panel home la repueble.
            if (deletedIds.has(state.currentPanel.id) ||
                (state.selectedPanel && deletedIds.has(state.selectedPanel.id))) {
                return { status: "loading" };
            }
            // No era el panel activo: alcanza con sacarlo de subPanels en
            // memoria, sin recargar nada — cero lecturas extra a Firestore.
            return {
                ...state,
                subPanels: state.subPanels.filter((p) => !deletedIds.has(p.id)),
            };
        }
        case "DELETE_ARCHIVED_ERROR":
            return {
                status: "error",
                error: action.payload,
            };
        case "SELECT_PANEL":
            return {
                status: "panel",
                currentPanel: action.payload,
                selectedPanel: undefined,
                // Panel nuevo: los subPanels anteriores ya no son válidos, se
                // recargan vía el efecto de sincronización en panelsContext.tsx.
                subPanels: [],
            };
        case "CLEAR_ERROR":
            return state.status === "error" ? { status: "loading" } : state;
        default:
            return state;
    }
}
