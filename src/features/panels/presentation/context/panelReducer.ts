import { DocumentReference } from "firebase/firestore";
import { type Panel } from "../../domain/panel.entity";

/**
 * @param subPanelsId Los paneles que se encuentran en la base de datos
 * @param selectedPanel El panel que se encuentra seleccionado
 * @param currentPanel Panel que en el que te encuentres
 * @param isLoading Si se encuentra cargando o no
 * @param error Error que devuelve
 */
export type PanelsState = {
  subPanelsId: DocumentReference[];
  selectedPanel?: Panel;
  currentPanel?: Panel;
  isLoading: boolean;
  error?: Error;
};

type PanelsAction =
  | { type: "FETCH_PANELS_START" }
  | { type: "FETCH_PANELS_SUCCESS"; payload: Panel[] }
  | { type: "FETCH_PANELS_ERROR"; payload: Error }
  | { type: "CREATE_PANEL_SUCCESS"; payload: Panel }
  | { type: "UPDATE_PANEL_SUCCESS"; payload: Panel }
  | { type: "DELETE_PANEL_SUCCESS"; payload: string }
  | { type: "SELECT_PANEL"; payload: Panel }
  | { type: "FETCH_SUB_PANELS"; payload: DocumentReference[] }
  | { type: "CLEAR_ERROR" };

export const initialPanelsState: PanelsState = {
  subPanelsId: [],
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
        currentPanel: state.currentPanel || action.payload[0],
      };

    case "FETCH_PANELS_ERROR":
      return { ...state, isLoading: false, error: action.payload };

    case "CREATE_PANEL_SUCCESS":
      return {
        ...state,
        error: undefined,
      };

    case "UPDATE_PANEL_SUCCESS":
      return {
        ...state,
        selectedPanel:
          state.selectedPanel?.id === action.payload.id
            ? action.payload
            : state.selectedPanel,
        error: undefined,
      };

    case "DELETE_PANEL_SUCCESS":
      return {
        ...state,
        error: undefined,
      };

    case "SELECT_PANEL":
      return {
        ...state,
        currentPanel: action.payload,
        selectedPanel: undefined,
      };

    case "FETCH_SUB_PANELS":
      return {
        ...state,
        subPanelsId: action.payload,
      };

    case "CLEAR_ERROR":
      return { ...state, error: undefined };

    default:
      return state;
  }
}
