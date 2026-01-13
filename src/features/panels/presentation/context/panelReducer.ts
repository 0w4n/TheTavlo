import { type Panel } from "../../domain/panel.entity"

export type PanelsState = {
  panels: Panel[];
  panelId: string | null;
  selectedPanel: Panel | null;
  loading: boolean;
  error: string | null;
};

type PanelsAction =
  | { type: "FETCH_PANELS_START" }
  | { type: "FETCH_PANELS_SUCCESS"; payload: Panel[] }
  | { type: "FETCH_PANELS_ERROR"; payload: string }
  | { type: "CREATE_PANEL_SUCCESS"; payload: Panel }
  | { type: "UPDATE_PANEL_SUCCESS"; payload: Panel }
  | { type: "DELETE_PANEL_SUCCESS"; payload: string }
  | { type: "SELECT_PANEL"; payload: Panel | null }
  | {
      type: "UPDATE_PANEL_STATS";
      payload: { panelId: string; stats: Panel["stats"] };
    }
  | { type: "REORDER_PANELS"; payload: Panel[] }
  | { type: "CLEAR_ERROR" };

export const initialPanelsState: PanelsState = {
  panels: [],
  panelId: null,
  selectedPanel: null,
  loading: false,
  error: null,
};

export function panelsReducer(
  state: PanelsState,
  action: PanelsAction
): PanelsState {
  switch (action.type) {
    case "FETCH_PANELS_START":
      return { ...state, loading: true, error: null };

    case "FETCH_PANELS_SUCCESS":
      return {
        ...state,
        loading: false,
        panels: action.payload,
        selectedPanel: state.selectedPanel || action.payload[0] || null,
      };

    case "FETCH_PANELS_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "CREATE_PANEL_SUCCESS":
      return {
        ...state,
        panels: [...state.panels, action.payload],
        error: null,
      };

    case "UPDATE_PANEL_SUCCESS":
      return {
        ...state,
        panels: state.panels.map((panel) =>
          panel.id === action.payload.id ? action.payload : panel
        ),
        selectedPanel:
          state.selectedPanel?.id === action.payload.id
            ? action.payload
            : state.selectedPanel,
        error: null,
      };

    case "DELETE_PANEL_SUCCESS":
      const newPanels = state.panels.filter(
        (panel) => panel.id !== action.payload
      );
      return {
        ...state,
        panels: newPanels,
        selectedPanel:
          state.selectedPanel?.id === action.payload
            ? newPanels[0] || null
            : state.selectedPanel,
        error: null,
      };

    case "SELECT_PANEL":
      return { ...state, selectedPanel: action.payload };

    case "UPDATE_PANEL_STATS":
      return {
        ...state,
        panels: state.panels.map((panel) =>
          panel.id === action.payload.panelId
            ? { ...panel, stats: action.payload.stats }
            : panel
        ),
      };

    case "REORDER_PANELS":
      return { ...state, panels: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}
