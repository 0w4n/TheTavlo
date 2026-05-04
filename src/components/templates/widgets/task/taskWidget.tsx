import LoadingPage from "#components/pages/LoadingPage";
import type { Task } from "#features/task/domain/task.entity";
import useTasks from "#features/task/presentation/hooks/useTask";

import "./taskWidget.css";

export function TaskWidget() {
  const { state } = useTasks();

  console.log("Task-State:", state.tasks);

  if (state.loading) {
    <LoadingPage />;
  } else if (!state.tasks) {
    return <span>No hay ninguna tarea</span>
  }  else {
    return <>{state.tasks.map((item) => taskItem(item))}</>;
  }
}

function taskItem(item: Task) {
  return (
    <>
      <div className="item">
        <span>{item.progress}</span>
        <span>{item.name}</span>
        <span>{item.endLine.toDate().toString()}</span>
      </div>
    </>
  );
}
