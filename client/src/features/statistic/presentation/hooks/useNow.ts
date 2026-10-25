import { useEffect, useState } from "react";

/**
 * "Ahora" que se refresca solo. Las estadísticas dependientes del tiempo
 * (vencidas, próximas a vencer, racha) cambian aunque los datos no cambien:
 * una tarea pasa a "vencida" a las 18:00 sin que nadie la edite.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
