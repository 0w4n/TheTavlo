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
import useGlobalContext from "#core/globalContext/useGlobalContext";

type WidgetsState = {
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  editMode: boolean;
};

type WidgetsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Widget[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ADD_WIDGET"; payload: Widget }
  | { type: "UPDATE_WIDGET"; payload: Widget }
  | { type: "UPDATE_LAYOUTS"; payload: Widget[] }
  | { type: "REMOVE_WIDGET"; payload: { panelId: string; widgetId: string } }
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "CLEAR_ERROR" };

const initialState: WidgetsState = {
  widgets: [],
  loading: false,
  error: null,
  editMode: false,
};

function widgetsReducer(
  state: WidgetsState,
  action: WidgetsAction
): WidgetsState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };

    case "FETCH_SUCCESS":
      return { ...state, loading: false, widgets: action.payload };

    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "ADD_WIDGET":
      return {
        ...state,
        widgets: [...state.widgets, action.payload],
      };

    case "UPDATE_WIDGET":
      return {
        ...state,
        widgets: state.widgets.map((w) =>
          w.id === action.payload.id ? action.payload : w
        ),
      };

    case "UPDATE_LAYOUTS":
      return { ...state, widgets: action.payload };

    case "REMOVE_WIDGET": {
      return {
        ...state,
        widgets: state.widgets.filter((w) => w.id !== action.payload.widgetId),
      };
    }

    case "TOGGLE_EDIT_MODE":
      return { ...state, editMode: !state.editMode };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

type WidgetsContextValue = {
  state: WidgetsState;
  fetchWidgets: (panelId: string) => Promise<void>;
  addWidget: (type: WidgetType) => Promise<void>;
  updateWidgetConfig: (
    widgetId: string,
    config: Record<string, any>
  ) => Promise<void>;
  updateLayouts: (widgets: Widget[]) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
  toggleEditMode: () => void;
  compactWidgets: () => Promise<void>;
  clearError: () => void;
};

export const WidgetsContext = createContext<WidgetsContextValue | null>(null);

export function WidgetsProvider({
  children,
  widgetService,
}: PropsWithChildren<{
  widgetService: WidgetService;
}>) {
  const [state, dispatch] = useReducer(widgetsReducer, initialState);
  const { state: stateGlobal } = useGlobalContext();
  const panelId = stateGlobal.panel.panelId;
  const userId = stateGlobal.user.userId;

  const fetchWidgets = useCallback(
    async (panelId: string) => {
      dispatch({ type: "FETCH_START" });
      try {
        const widgets = await widgetService.getPanelWidgets(panelId);
        dispatch({ type: "FETCH_SUCCESS", payload: widgets });
      } catch (error) {
        dispatch({ type: "FETCH_ERROR", payload: "Error al cargar widgets" });
      }
    },
    [widgetService]
  );

  const addWidget = useCallback(
    async (type: WidgetType) => {
      const result = await widgetService.addWidget(type);

      if (result.error) {
        dispatch({ type: "FETCH_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      if (result.widget) {
        dispatch({ type: "ADD_WIDGET", payload: result.widget });
      }
    },
    [widgetService]
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
    [widgetService]
  );

  const updateLayouts = useCallback(
    async (widgets: Widget[]) => {
      const updates = widgets.map((w) => ({
        id: w.id,
        layout: w.layout,
      }));

      const result = await widgetService.updateWidgetLayouts(updates);
      if (result.error) {
        dispatch({ type: "FETCH_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      dispatch({ type: "UPDATE_LAYOUTS", payload: widgets });
    },
    [widgetService]
  );

  const removeWidget = async (widgetId: string) => {
    if (!userId) return;

    await widgetService.removeWidget(userId, panelId, widgetId);

    dispatch({
      type: "REMOVE_WIDGET",
      payload: {
        panelId,
        widgetId,
      },
    });
  };

  const toggleEditMode = useCallback(() => {
    dispatch({ type: "TOGGLE_EDIT_MODE" });
  }, []);

  const compactWidgets = useCallback(async () => {
    const result = await widgetService.compactWidgets(panelId);
    if (result.error) {
      dispatch({ type: "FETCH_ERROR", payload: result.error });
      throw new Error(result.error);
    }
    await fetchWidgets(panelId);
  }, [widgetService, fetchWidgets]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  useEffect(() => {
    fetchWidgets(panelId);
  }, []);

  const value: WidgetsContextValue = {
    state,
    fetchWidgets,
    addWidget,
    updateWidgetConfig,
    updateLayouts,
    removeWidget,
    toggleEditMode,
    compactWidgets,
    clearError,
  };

  return (
    <WidgetsContext.Provider value={value}>{children}</WidgetsContext.Provider>
  );
}
