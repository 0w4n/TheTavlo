import type { Widget } from "#features/widgets/domain/widget.entity";
import type { ResponsiveLayouts } from "react-grid-layout";
export type WidgetsState = {
    widgets: Widget[];
    isLoading: boolean;
    error?: string;
    editMode: boolean;
};
export type WidgetsAction = {
    type: "FETCH_START";
} | {
    type: "FETCH_SUCCESS";
    payload: Widget[];
} | {
    type: "FETCH_ERROR";
    payload: string;
} | {
    type: "ADD_WIDGET";
    payload: Widget;
} | {
    type: "UPDATE_WIDGET";
    payload: Widget;
} | {
    type: "UPDATE_LAYOUTS";
    payload: ResponsiveLayouts;
} | {
    type: "REMOVE_WIDGET";
    payload: {
        panelId: string;
        widgetId: string;
    };
} | {
    type: "TOGGLE_EDIT_MODE";
} | {
    type: "CLEAR_ERROR";
};
export declare const initialState: WidgetsState;
export declare function widgetsReducer(state: WidgetsState, action: WidgetsAction): WidgetsState;
