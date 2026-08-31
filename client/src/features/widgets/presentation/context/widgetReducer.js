export const initialState = {
    widgets: [],
    isLoading: true,
    error: undefined,
    editMode: false,
};
export function widgetsReducer(state, action) {
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
                widgets: state.widgets.map((w) => w.id === action.payload.id ? action.payload : w),
            };
        case "UPDATE_LAYOUTS": {
            const layouts = action.payload;
            if (!layouts)
                return state;
            return {
                ...state,
                widgets: state.widgets.map((widget) => {
                    const updatedLayouts = Object.fromEntries(Object.entries(layouts).map(([breakpoint, layout]) => {
                        const item = layout?.find((l) => l.i === widget.id);
                        return [
                            breakpoint,
                            item ? { ...item } : widget.layout[breakpoint],
                        ];
                    }));
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
