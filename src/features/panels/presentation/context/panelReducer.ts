import { type Panel } from "../../domain/panel.entity";
import type { AppErr } from "#core/appCore/domain/AppCore.type";

/**
 * @param selectedPanel El panel que se encuentra seleccionado
 * @param currentPanel Panel en el que te encuentres
 * @param isLoading Si se encuentra cargando o no
 * @param error Error que devuelve
 */
export type PanelsState =
  | {
      status: "loading";
    }
  | {
      status: "panel";
      selectedPanel?: Panel;
      currentPanel: Panel;
    }
  | {
      status: "error";
      error?: AppErr;
    };

type PanelsAction =
  | { type: "FETCH_PANELS_START" }
  | { type: "FETCH_PANELS_SUCCESS"; payload: Panel[] }
  | { type: "FETCH_PANELS_ERROR"; payload: AppErr }
  | { type: "CREATE_PANEL_SUCCESS"; payload: Panel }
  | { type: "UPDATE_PANEL_SUCCESS"; payload: Panel }
  | { type: "DELETE_PANEL_SUCCESS"; payload: string }
  | { type: "DELETE_PANEL_CASCADE_SUCCESS"; payload: { deletedIds: string[] } }
  | { type: "REFRESH_PANEL" }
  | { type: "SELECT_PANEL"; payload: Panel }
  | { type: "CLEAR_ERROR" };

export const initialPanelsState: PanelsState = {
  status: "loading",
};

export function panelsReducer(
  state: PanelsState,
  action: PanelsAction,
): PanelsState {
  switch (action.type) {
    case "FETCH_PANELS_START":
      return {
        status: "loading",
      };

    case "FETCH_PANELS_SUCCESS": {
      const incoming = action.payload;

      console.log("FETCH_PANELS_SUCCESS@incoming: ", incoming);

      const currentPanel = incoming[0];

      console.log("FETCH_PANELS_SUCCESS@currentPanel: ", currentPanel);

      return {
        status: "panel",
        currentPanel,
        selectedPanel: undefined,
      };
    }

    case "FETCH_PANELS_ERROR":
      return {
        status: "error",
        error: action.payload,
      };

    case "CREATE_PANEL_SUCCESS":
      return state;

    case "UPDATE_PANEL_SUCCESS":
      if (state.status !== "panel") return state;

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
      };

    case "DELETE_PANEL_SUCCESS":
      if (state.status !== "panel") return state;

      return {
        status: "loading",
      };

    case "DELETE_PANEL_CASCADE_SUCCESS":
      // Mismo criterio que DELETE_PANEL_SUCCESS: cualquiera de los ids
      // borrados (el panel objetivo o alguno de sus descendientes) pudo ser
      // el currentPanel/selectedPanel — la forma segura de no dejar la UI
      // apuntando a un panel fantasma es volver a "loading" y dejar que la
      // suscripción al panel home la repueble.
      if (state.status !== "panel") return state;

      return {
        status: "loading",
      };

    case "REFRESH_PANEL":
      if (state.status !== "panel") return state;
      return {...state};

    case "SELECT_PANEL":
      return {
        status: "panel",
        currentPanel: action.payload,
        selectedPanel: undefined,
      };

    case "CLEAR_ERROR":
      return state.status === "error" ? { status: "loading" } : state;

    default:
      return state;
  }
}
