export const initialTasksState = {
    status: "loading",
};
export function tasksReducer(state, action) {
    switch (action.type) {
        case "FETCH_TASKS_START":
            return { status: "loading" };
        case "FETCH_TASKS_SUCCESS":
            return { status: "task", currentTask: action.payload };
        case "FETCH_TASKS_ERROR":
            return { status: "error", error: action.payload };
        case "CREATE_TASK_SUCCESS":
            return state;
        case "UPDATE_TASK_SUCCESS":
            if (state.status !== "task")
                return state;
            return {
                ...state,
                selectedTask: state.selectedTask?.id === action.payload.id
                    ? action.payload
                    : state.selectedTask,
                currentTask: state.currentTask.map((task) => {
                    return task.id === action.payload.id ? action.payload : task;
                }),
            };
        case "DELETE_TASK_SUCCESS":
            if (state.status !== "task")
                return state;
            return {
                ...state,
                currentTask: state.currentTask.filter((task) => task.id !== action.payload),
                selectedTask: undefined,
            };
        case "SELECT_TASK":
            if (state.status !== "task")
                return state;
            return { ...state, selectedTask: action.payload };
        case "CLEAR_ERROR":
            return { status: "error", error: undefined };
        default:
            return state;
    }
}
