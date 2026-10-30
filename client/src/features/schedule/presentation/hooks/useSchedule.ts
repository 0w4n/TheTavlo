import { useContext } from "react";
import { ScheduleContext } from "../context/scheduleContext";

export default function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule debe usarse dentro de ScheduleProvider");
  }
  return context;
}
