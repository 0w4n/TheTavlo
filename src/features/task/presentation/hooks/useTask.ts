import { useContext } from "react";
import { TasksContext } from "../context/TasksContext";

export default function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks debe usarse dentro de WidgetsProvider");
  }
  return context;
}