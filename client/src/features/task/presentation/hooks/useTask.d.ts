export default function useTasks(): {
    state: import("../context/taskReducer").TasksState;
    fetchTasks: () => Promise<void>;
    createTask: (data: import("../../domain/task.entity").CreateAnyTaskDTO[]) => Promise<void>;
    updateTask: (id: string, data: import("../../domain/task.entity").UpdateAnyTaskDTO) => Promise<void>;
    completeTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    selectTask: (task: import("../../domain/task.entity").AnyTask) => void;
    clearError: () => void;
};
