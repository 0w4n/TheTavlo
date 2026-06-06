import { type Panel } from "../../domain/panel.entity";
import type { AppErr } from "#core/appCore/domain/AppCore.type";

/**
 * @param selectedPanel El panel que se encuentra seleccionado
 * @param currentPanel Panel en el que te encuentres
 * @param isLoading Si se encuentra cargando o no
 * @param error Error que devuelve
 */
export type PanelsState = {
  selectedPanel?: Panel;
  currentPanel?: Panel;
  isLoading: boolean;
  error?: AppErr;
};

type PanelsAction =
  | { type: "FETCH_PANELS_START" }
  | { type: "FETCH_PANELS_SUCCESS"; payload: Panel[] }
  | { type: "FETCH_PANELS_ERROR"; payload: AppErr }
  | { type: "CREATE_PANEL_SUCCESS"; payload: Panel }
  | { type: "UPDATE_PANEL_SUCCESS"; payload: Panel }
  | { type: "DELETE_PANEL_SUCCESS"; payload: string }
  | { type: "SELECT_PANEL"; payload: Panel }
  | { type: "CLEAR_ERROR" };

export const initialPanelsState: PanelsState = {
  selectedPanel: undefined,
  currentPanel: undefined,
  isLoading: false,
  error: undefined,
};

export function panelsReducer(
  state: PanelsState,
  action: PanelsAction,
): PanelsState {
  switch (action.type) {
    case "FETCH_PANELS_START":
      return { ...state, isLoading: true, error: undefined };

    case "FETCH_PANELS_SUCCESS":
      return {
        ...state,
        isLoading: false,
        currentPanel: state.currentPanel ?? action.payload[0],
      };

    case "FETCH_PANELS_ERROR":
      return { ...state, isLoading: false, error: action.payload };

    case "CREATE_PANEL_SUCCESS":
      return { ...state, error: undefined };

    case "UPDATE_PANEL_SUCCESS":
      return {
        ...state,
        selectedPanel:
          state.selectedPanel?.id === action.payload.id
            ? action.payload
            : state.selectedPanel,
        currentPanel:
          state.currentPanel?.id === action.payload.id
            ? action.payload
            : state.currentPanel,
        error: undefined,
      };

    case "DELETE_PANEL_SUCCESS":
      return {
        ...state,
        selectedPanel:
          state.selectedPanel?.id === action.payload
            ? undefined
            : state.selectedPanel,
        currentPanel:
          state.currentPanel?.id === action.payload
            ? undefined
            : state.currentPanel,
        error: undefined,
      };

    case "SELECT_PANEL":
      return {
        ...state,
        currentPanel: action.payload,
        selectedPanel: undefined,
      };

    case "CLEAR_ERROR":
      return { ...state, error: undefined };

    default:
      return state;
  }
}
