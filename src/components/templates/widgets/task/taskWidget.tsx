import LoadingPage from "#components/pages/LoadingPage";
import { isNodeTask, isTask, type AnyTask } from "#features/task/domain/task.entity";
import useTasks from "#features/task/presentation/hooks/useTask";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import Icon from "#shared/ui/atoms/icons";
import { Badge } from "#components/atoms/badge";

import "./taskWidget.css";

export function TaskWidget() {
  const { state: taskState } = useTasks();
  const { state: panelState } = usePanels();

  console.log("status Task: ", taskState);

  if (panelState.status !== "panel") {
    return <LoadingPage/>;
  }

  const currentPanel = panelState.currentPanel;

  if (taskState.loading) {
    <LoadingPage />;
  } else if (!taskState.tasks || currentPanel === undefined) {
    return <span>No hay nada</span>;
  } else {
    return (
      <>{taskState.tasks.map((item) => taskItem(item))}</>
    );
  }
}

function taskItem(item: AnyTask) {
  if(isTask(item)) {
    console.log("Task: ", item)
    return (
      <>
        <div className="task__item">
          <Badge variant={item.progress} collapsed />
          <div className="task__item-content">
            <span>{item.endAt.toDate().getDate()}</span>
            <div className="task__item-content--text">
              <Icon name="IconUsersGroup" color="hsl(0, 0%, 80%)" size={18} />
              <span>{item.title}</span>
              <Icon name="IconArrowNarrowRightDashed" color="#fff" />
            </div>
          </div>
        </div>
      </>
    );
  } else if (isNodeTask(item)) {
    console.log("Node task: ", item);
    
    return (
      <>
        <div className="task__item">
          <div className="task__item-content">
            <span>{item.endAt.toDate().getDate()}</span>
            <div className="task__item-content--text">
              <span>{item.title}</span>
              <Icon name="IconArrowNarrowRightDashed" color="#fff" />
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="task__item">
          <p>Error</p>
        </div>
      </>
    );
  }
}
