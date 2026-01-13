import usePanels from "#features/panels/presentation/hooks/usePanels";
import useTasks from "#features/task/presentation/hooks/useTask";
import { useEffect } from "react";

export default function TasksList({ panelId }: { panelId: string }) {
  const { state, fetchTasks } = useTasks();
  const { refreshPanelStats } = usePanels();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, panelId]);

  useEffect(() => {
    // Actualizar stats del panel cuando cambien las tareas
    refreshPanelStats(panelId);
  }, [state.tasks, panelId, refreshPanelStats]);

  const panelTasks = state.tasks.filter((task) => task.id === panelId);

  return (
    <div>
      <h2>Tareas en este panel</h2>
      {panelTasks.length === 0 ? (
        <p>No hay tareas en este panel</p>
      ) : (
        <div>
          {panelTasks.map((task) => (
            <div
              key={task.id}
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                marginBottom: "0.5rem",
              }}
            >
              {task.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
