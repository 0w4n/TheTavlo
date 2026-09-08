// --- DEFINICIONES DE TIPOS ---

export interface TaskInput {
  id: string;
  title: string;
  estimatedMinutes: number;
  energyRequired: number; // 1 (muy baja energía) a 5 (alta energía)
}

export interface FixedEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
}

export interface ScheduledItem {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'FIXED' | 'TASK' | 'TRANSITION' | 'REST';
  energyLevel?: number;
}

interface SchedulerConfig {
  startTime: Date;                  // Hora de inicio deseada (ej: 15:00)
  endTime: Date;                    // Hora límite de la tarde (ej: 22:00)
  transitionAfterTaskMinutes?: number;  // Colchón entre tareas (ej: 10 min)
  transitionAfterFixedMinutes?: number; // Descanso tras eventos fijos (ej: 5-10 min)
}

// --- ALGORITMO PRINCIPAL ---

export function calculateSchedule(
  tasks: TaskInput[],
  fixedEvents: FixedEvent[],
  config: SchedulerConfig
): ScheduledItem[] {
  const {
    startTime,
    endTime,
    transitionAfterTaskMinutes = 10,
    transitionAfterFixedMinutes = 10, // 5 a 10 min de descanso tras evento fijo
  } = config;

  const schedule: ScheduledItem[] = [];
  const now = new Date();

  // 1. Determinar el inicio efectivo: nunca en el pasado
  let effectiveStart = new Date(Math.max(startTime.getTime(), now.getTime()));

  // 2. Ordenar eventos fijos cronológicamente y filtrar los ya pasados
  const sortedFixedEvents = fixedEvents
    .filter(event => event.endTime > effectiveStart)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Agregar los eventos fijos al calendario
  for (const event of sortedFixedEvents) {
    schedule.push({
      id: event.id,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      type: 'FIXED',
    });
  }

  // 3. Si hay un evento fijo al inicio (ej. siesta hasta las 16:00), 
  // asegurar que la planificación empiece DESPUÉS de ese evento + descanso
  for (const fixed of sortedFixedEvents) {
    if (fixed.startTime <= effectiveStart && fixed.endTime > effectiveStart) {
      // El tiempo actual/de inicio cae dentro del evento fijo (ej. siesta)
      const restAfterFixed = new Date(fixed.endTime.getTime() + transitionAfterFixedMinutes * 60 * 1000);
      effectiveStart = restAfterFixed;
    }
  }

  // 4. Ordenar tareas flexibles por nivel de energía (ganas) de mayor a menor
  const sortedTasks = [...tasks].sort((a, b) => {
    if (b.energyRequired !== a.energyRequired) {
      return b.energyRequired - a.energyRequired;
    }
    return a.estimatedMinutes - b.estimatedMinutes;
  });

  // 5. Ubicar tareas en huecos disponibles (Gap-Filling)
  let currentTime = new Date(effectiveStart);

  for (const task of sortedTasks) {
    const taskDurationMs = task.estimatedMinutes * 60 * 1000;
    let placed = false;

    while (currentTime < endTime && !placed) {
      const proposedEnd = new Date(currentTime.getTime() + taskDurationMs);

      // Comprobar si choca con algún evento fijo o tarea ya agendada
      const conflictingItem = schedule.find(item => 
        (currentTime < item.endTime && proposedEnd > item.startTime)
      );

      if (conflictingItem) {
        // Si el conflicto es con un evento fijo, añadimos el descanso post-evento fijo (5-10 min)
        const buffer = conflictingItem.type === 'FIXED' 
          ? transitionAfterFixedMinutes 
          : transitionAfterTaskMinutes;

        currentTime = new Date(conflictingItem.endTime.getTime() + buffer * 60 * 1000);
      } else {
        // Si no hay conflicto y cabe antes de la hora límite
        if (proposedEnd <= endTime) {
          schedule.push({
            id: task.id,
            title: task.title,
            startTime: new Date(currentTime),
            endTime: proposedEnd,
            type: 'TASK',
            energyLevel: task.energyRequired,
          });

          // Avanzar el reloj + tiempo de transición/descanso entre tareas
          currentTime = new Date(proposedEnd.getTime() + transitionAfterTaskMinutes * 60 * 1000);
          placed = true;
        } else {
          // La tarea sobrepasa la hora límite de la tarde
          break;
        }
      }
    }
  }

  // Devolver el horario final ordenado por hora de inicio
  return schedule.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}