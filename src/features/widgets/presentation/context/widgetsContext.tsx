import type { WidgetService } from "../../app/widget.service";
import type {
  Widget,
  WidgetType,
} from "#features/widgets/domain/widget.entity";
import {
  createContext,
  type PropsWithChildren,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import type { ResponsiveLayouts } from "react-grid-layout";
import {
  initialState,
  widgetsReducer,
  type WidgetsState,
} from "./widgetReducer";

type WidgetsContextValue = {
  state: WidgetsState;
  fetchWidgets: (panelId: string) => Promise<void>;
  addWidget: (type: WidgetType) => Promise<Widget>;
  updateWidgetConfig: (
    widgetId: string,
    config: Record<string, any>,
  ) => Promise<void>;
  updateLayout: (layout: ResponsiveLayouts) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
  toggleEditMode: () => void;
  clearError: () => void;
};

export const WidgetsContext = createContext<WidgetsContextValue | undefined>(
  undefined,
);

export function WidgetsProvider({
  children,
  widgetService,
}: PropsWithChildren<{ widgetService: WidgetService }>) {
  const [state, dispatch] = useReducer(widgetsReducer, initialState);
  const { state: stateGlobal } = useGlobalContext();
  const panelId = stateGlobal.panel.panelId;
  const userId = stateGlobal.user.userId;

  // ─── Suscripción en tiempo real ──────────────────────────────────────────
  // Se crea cuando panelId cambia y se limpia automáticamente al desmontar
  // o cuando panelId vuelve a cambiar.

  useEffect(() => {
    if (!panelId) return;

    dispatch({ type: "FETCH_START" });

    const unsubscribe = widgetService.subscribeToPanel(
      (widgets) => dispatch({ type: "FETCH_SUCCESS", payload: widgets }),
      (error) => dispatch({ type: "FETCH_ERROR", payload: error }),
    );

    // Limpieza: cancela la suscripción de Firestore
    return unsubscribe;
  }, [panelId, widgetService]);

  // ─── Fetch puntual (por compatibilidad / refresh manual) ─────────────────

  const fetchWidgets = useCallback(
    async (_panelId: string) => {
      dispatch({ type: "FETCH_START" });
      try {
        const widgets = await widgetService.getPanelWidgets(_panelId);
        dispatch({ type: "FETCH_SUCCESS", payload: widgets });
      } catch {
        dispatch({ type: "FETCH_ERROR", payload: "Error al cargar widgets" });
      }
    },
    [widgetService],
  );

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  const addWidget = useCallback(
    async (type: WidgetType): Promise<Widget> => {
      const result = await widgetService.addWidget(type);
      if (result.error || !result.widget) {
        const msg = (result.error ?? "widget undefined") as string;
        dispatch({ type: "FETCH_ERROR", payload: msg });
        throw new Error(msg);
      }
      // onSnapshot actualizará el estado automáticamente;
      // el dispatch local es para respuesta inmediata (optimistic)
      dispatch({ type: "ADD_WIDGET", payload: result.widget });
      return result.widget;
    },
    [widgetService],
  );

  const updateWidgetConfig = useCallback(
    async (widgetId: string, config: Record<string, any>) => {
      const result = await widgetService.updateWidgetConfig(widgetId, config);
      if (result.error) {
        dispatch({ type: "FETCH_ERROR", payload: result.error });
        throw new Error(result.error);
      }
      if (result.widget) {
        dispatch({ type: "UPDATE_WIDGET", payload: result.widget });
      }
    },
    [widgetService],
  );

  const updateLayout = useCallback(
    async (layouts: ResponsiveLayouts) => {
      const result = await widgetService.updateWidgetLayout(layouts);
      if (!result.success) {
        const msg = result.error ?? "Error al actualizar layout";
        dispatch({ type: "FETCH_ERROR", payload: msg });
        throw new Error(msg);
      }
      // Actualización optimista — onSnapshot confirma después
      dispatch({ type: "UPDATE_LAYOUTS", payload: layouts });
    },
    [widgetService],
  );

  const removeWidget = useCallback(
    async (widgetId: string) => {
      if (!userId) return;
      await widgetService.removeWidget(widgetId);
      // Optimistic: onSnapshot también lo reflejará
      dispatch({ type: "REMOVE_WIDGET", payload: { panelId, widgetId } });
    },
    [widgetService, userId, panelId],
  );

  const toggleEditMode = useCallback(() => {
    dispatch({ type: "TOGGLE_EDIT_MODE" });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value: WidgetsContextValue = {
    state,
    fetchWidgets,
    addWidget,
    updateWidgetConfig,
    updateLayout,
    removeWidget,
    toggleEditMode,
    clearError,
  };

  return (
    <WidgetsContext.Provider value={value}>{children}</WidgetsContext.Provider>
  );
}
