import type { Widget } from "#features/widgets/domain/widget.entity";
import type { ResponsiveLayouts } from "react-grid-layout";

export type WidgetsState = {
  widgets: Widget[];
  isLoading: boolean;
  error?: string;
  editMode: boolean;
};

export type WidgetsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Widget[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "ADD_WIDGET"; payload: Widget }
  | { type: "UPDATE_WIDGET"; payload: Widget }
  | { type: "UPDATE_LAYOUTS"; payload: ResponsiveLayouts }
  | { type: "REMOVE_WIDGET"; payload: { panelId: string; widgetId: string } }
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "CLEAR_ERROR" };

export const initialState: WidgetsState = {
  widgets: [],
  isLoading: true,
  error: undefined,
  editMode: false,
};

export function widgetsReducer(
  state: WidgetsState,
  action: WidgetsAction,
): WidgetsState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: undefined };

    case "FETCH_SUCCESS":
      return { ...state, isLoading: false, widgets: action.payload };

    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };

    case "ADD_WIDGET":
      return {
        ...state,
        widgets: [...state.widgets, action.payload],
      };

    case "UPDATE_WIDGET":
      return {
        ...state,
        widgets: state.widgets.map((w) =>
          w.id === action.payload.id ? action.payload : w,
        ),
      };

    case "UPDATE_LAYOUTS": {
      const layouts = action.payload;
      if (!layouts) return state;

      return {
        ...state,
        widgets: state.widgets.map((widget) => {
          const updatedLayouts = Object.fromEntries(
            Object.entries(layouts).map(([breakpoint, layout]) => {
              const item = layout?.find((l) => l.i === widget.id);

              return [
                breakpoint,
                item
                  ? [
                      {
                        ...item,
                      },
                    ]
                  : [],
              ];
            }),
          );

          return {
            ...widget,
            layout: updatedLayouts,
          };
        }),
      };
    }

    case "REMOVE_WIDGET": {
      return {
        ...state,
        widgets: state.widgets.filter((w) => w.id !== action.payload.widgetId),
      };
    }

    case "TOGGLE_EDIT_MODE":
      return { ...state, editMode: !state.editMode };

    case "CLEAR_ERROR":
      return { ...state, error: undefined };

    default:
      return state;
  }
}
