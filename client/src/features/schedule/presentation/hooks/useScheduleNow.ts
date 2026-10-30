import { useEffect, useState } from "react";
import useSchedule from "./useSchedule";

/**
 * "Ahora" de la feature, refrescado cada `intervalMs`. Lee el reloj del
 * ScheduleProvider (no `new Date()` directo) para que tests y sandbox puedan
 * controlar la hora. Una clase pasa de "próxima" a "en curso" sin que nadie
 * toque nada, así que los widgets de tiempo real dependen de esto.
 */
export default function useScheduleNow(intervalMs = 30_000): Date {
  const { now } = useSchedule();
  const [current, setCurrent] = useState<Date>(() => now());

  useEffect(() => {
    setCurrent(now());
    const id = window.setInterval(() => setCurrent(now()), intervalMs);
    return () => window.clearInterval(id);
  }, [now, intervalMs]);

  return current;
}
