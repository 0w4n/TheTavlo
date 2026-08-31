import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useReducer, useCallback, useEffect, useMemo } from "react";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import { initialState, widgetsReducer, } from "./widgetReducer";
export const WidgetsContext = createContext(undefined);
export function WidgetsProvider({ children, widgetService, }) {
    const [state, dispatch] = useReducer(widgetsReducer, initialState);
    const { state: stateGlobal } = useGlobalContext();
    const panelId = stateGlobal.panel.panelId;
    const userId = stateGlobal.user.userId;
    // ─── Suscripción en tiempo real ──────────────────────────────────────────
    // Se crea cuando panelId cambia y se limpia automáticamente al desmontar
    // o cuando panelId vuelve a cambiar.
    useEffect(() => {
        if (!panelId)
            return;
        dispatch({ type: "FETCH_START" });
        const unsubscribe = widgetService.subscribeToPanel((widgets) => dispatch({ type: "FETCH_SUCCESS", payload: widgets }), (error) => dispatch({ type: "FETCH_ERROR", payload: error }));
        // Limpieza: cancela la suscripción de Firestore
        return unsubscribe;
    }, [panelId, widgetService]);
    // ─── Fetch puntual (por compatibilidad / refresh manual) ─────────────────
    const fetchWidgets = useCallback(async (_panelId) => {
        dispatch({ type: "FETCH_START" });
        try {
            const widgets = await widgetService.getPanelWidgets(_panelId);
            dispatch({ type: "FETCH_SUCCESS", payload: widgets });
        }
        catch {
            dispatch({ type: "FETCH_ERROR", payload: "Error al cargar widgets" });
        }
    }, [widgetService]);
    // ─── Mutaciones ──────────────────────────────────────────────────────────
    const addWidget = useCallback(async (type) => {
        const result = await widgetService.addWidget(type);
        if (result.error || !result.widget) {
            const msg = (result.error ?? "widget undefined");
            dispatch({ type: "FETCH_ERROR", payload: msg });
            throw new Error(msg);
        }
        // onSnapshot actualizará el estado automáticamente;
        // el dispatch local es para respuesta inmediata (optimistic)
        dispatch({ type: "ADD_WIDGET", payload: result.widget });
        return result.widget;
    }, [widgetService]);
    const updateWidgetConfig = useCallback(async (widgetId, config) => {
        const result = await widgetService.updateWidgetConfig(widgetId, config);
        if (result.error) {
            dispatch({ type: "FETCH_ERROR", payload: result.error });
            throw new Error(result.error);
        }
        if (result.widget) {
            dispatch({ type: "UPDATE_WIDGET", payload: result.widget });
        }
    }, [widgetService]);
    const updateLayout = useCallback(async (layouts) => {
        const result = await widgetService.updateWidgetLayout(layouts);
        if (!result.success) {
            const msg = result.error ?? "Error al actualizar layout";
            dispatch({ type: "FETCH_ERROR", payload: msg });
            throw new Error(msg);
        }
        // Actualización optimista — onSnapshot confirma después
        dispatch({ type: "UPDATE_LAYOUTS", payload: layouts });
    }, [widgetService]);
    const removeWidget = useCallback(async (widgetId) => {
        if (!userId)
            return;
        await widgetService.removeWidget(widgetId);
        // Optimistic: onSnapshot también lo reflejará
        dispatch({ type: "REMOVE_WIDGET", payload: { panelId, widgetId } });
    }, [widgetService, userId, panelId]);
    const toggleEditMode = useCallback(() => {
        dispatch({ type: "TOGGLE_EDIT_MODE" });
    }, []);
    const clearError = useCallback(() => {
        dispatch({ type: "CLEAR_ERROR" });
    }, []);
    const value = useMemo(() => ({
        state,
        fetchWidgets,
        addWidget,
        updateWidgetConfig,
        updateLayout,
        removeWidget,
        toggleEditMode,
        clearError,
    }), [state, fetchWidgets, addWidget, updateWidgetConfig, updateLayout, removeWidget, toggleEditMode, clearError]);
    return (_jsx(WidgetsContext.Provider, { value: value, children: children }));
}
