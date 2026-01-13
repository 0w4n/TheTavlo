type TaskType = "Estudio" | "Descanso" | "Repaso" | "Evento" | "Examen";
type EnergyLevel = "Alta" | "Media" | "Baja";

type ExamTopic = {
  id: string;
  name: string;
  estimatedMinutes: number;
  difficulty?: number; // 1-5
  completed?: boolean; // Para tracking de progreso
};

type Exam = {
  id: string;
  name: string;
  date: string;
  topics: ExamTopic[];
  importance?: number;
  timezone?: string;
  color?: string; // Para UI
};

type Task = {
  id: string;
  name: string;
  duration: number;
  type: TaskType;
  deadline?: string;
  startTime?: string;
  importance?: number;
  energyRequired?: EnergyLevel;
  parentExam?: string;
  topicId?: string;
  timezone?: string;
  completed?: boolean;
  color?: string;
};

type EnergyBlock = {
  start: string;
  end: string;
  level: EnergyLevel;
};

type PlannedTask = Task & {
  energyBlock?: EnergyLevel;
  scheduledTime?: string;
  scheduledTimeDisplay?: string;
  isOptimal?: boolean; // Si la energía coincide con requerida
  canReschedule?: boolean; // Si se puede mover
};

// ⚙️ Configuración TDA (exportable para UI settings)
type TDAConfig = {
  maxFocusTime: number;
  shortBreak: number;
  longBreak: number;
  maxSessionsBeforeLongBreak: number;
  taskSwitchPenalty: number;
  varietyBonus: boolean;
  allowLowEnergyStudy: boolean; // Permitir estudio en baja energía
};

const DEFAULT_TDA_CONFIG: TDAConfig = {
  maxFocusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  maxSessionsBeforeLongBreak: 4,
  taskSwitchPenalty: 5,
  varietyBonus: true,
  allowLowEnergyStudy: false,
};

// 📊 Resultado del algoritmo con metadatos para UI
type PlanningResult = {
  tasks: PlannedTask[];
  stats: {
    totalStudyTime: number;
    totalBreakTime: number;
    totalTasks: number;
    completedTasks: number;
    subjectsCount: number;
    averageSessionLength: number;
    energyDistribution: Record<EnergyLevel, number>;
  };
  warnings: string[]; // Alertas para el usuario
  suggestions: string[]; // Sugerencias de optimización
};

// 🎯 Clase principal del planificador
class TDAStudyPlanner {
  private config: TDAConfig;
  private timezone: string;

  constructor(
    config: Partial<TDAConfig> = {},
    timezone: string = "Europe/Madrid"
  ) {
    this.config = { ...DEFAULT_TDA_CONFIG, ...config };
    this.timezone = timezone;
  }

  // 📅 Método principal de planificación
  plan(
    tasks: Task[],
    exams: Exam[],
    availableTime: number,
    energyBlocks: EnergyBlock[],
    startTime: string = "09:00"
  ): PlanningResult {
    const now = new Date();
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 1️⃣ Validar datos
    this.validateInputs(tasks, exams, energyBlocks, warnings);

    // 2️⃣ Expandir exámenes
    const examTasks = this.expandExamsToTasks(exams, now);
    const allTasks = [...tasks, ...examTasks];

    // 3️⃣ Calcular prioridades
    const withPriority = this.calculatePriorities(allTasks, now, warnings);

    // 4️⃣ Separar y ordenar
    const events = withPriority.filter(
      (t) => t.type === "Evento" || t.type === "Examen"
    );
    const studyTasks = withPriority.filter(
      (t) => t.type === "Estudio" || t.type === "Repaso"
    );

    events.sort((a, b) => this.compareEventTimes(a, b));
    studyTasks.sort((a, b) => a.priority - b.priority);

    // 5️⃣ Programar tareas
    const planned = this.scheduleTasksForTDA(
      studyTasks,
      events,
      availableTime,
      energyBlocks,
      startTime,
      suggestions
    );

    // 6️⃣ Calcular estadísticas
    const stats = this.calculateStats(planned);

    return { tasks: planned, stats, warnings, suggestions };
  }

  // 🔍 Validar entradas
  private validateInputs(
    tasks: Task[],
    exams: Exam[],
    energyBlocks: EnergyBlock[],
    warnings: string[]
  ): void {
    // Verificar tareas sin deadline
    const noDeadline = tasks.filter((t) => !t.deadline && t.type === "Estudio");
    if (noDeadline.length > 0) {
      warnings.push(
        `${noDeadline.length} tareas sin fecha límite. Se priorizarán al final.`
      );
    }

    // Verificar exámenes muy cercanos
    const now = new Date();
    exams.forEach((exam) => {
      const examDate = parseISOWithTimezone(
        exam.date,
        exam.timezone || this.timezone
      );
      const hoursUntil = (examDate.getTime() - now.getTime()) / 3600000;
      if (hoursUntil < 6 && hoursUntil > 0) {
        warnings.push(
          `⚠️ Examen "${exam.name}" en menos de 6 horas. Considera repaso urgente.`
        );
      }
    });

    // Verificar bloques de energía
    if (energyBlocks.length === 0) {
      warnings.push(
        "No hay bloques de energía definidos. Se usará energía media por defecto."
      );
    }
  }

  // 🧮 Calcular prioridades
  private calculatePriorities(
    tasks: Task[],
    now: Date,
    warnings: string[]
  ): (Task & { priority: number })[] {
    return tasks.map((task) => {
      let priority = Infinity;

      if (task.deadline) {
        const deadlineDate = parseISOWithTimezone(
          task.deadline,
          task.timezone || this.timezone
        );
        const diffMinutes = (deadlineDate.getTime() - now.getTime()) / 60000;

        if (diffMinutes < 0) {
          warnings.push(`⏰ Tarea "${task.name}" ya pasó su fecha límite.`);
          priority = 0; // Máxima prioridad
        } else {
          const timeFactor = 1 / diffMinutes;
          const importanceFactor = task.importance
            ? (6 - task.importance) / 5
            : 1;
          priority = timeFactor * importanceFactor;
        }
      }

      return { ...task, priority };
    });
  }

  // 🧠 Expandir exámenes
  private expandExamsToTasks(exams: Exam[], now: Date): Task[] {
    const tasks: Task[] = [];

    for (const exam of exams) {
      const examTimezone = exam.timezone || this.timezone;

      // Evento del examen
      tasks.push({
        id: `exam-event-${exam.id}`,
        name: exam.name,
        duration: 90,
        type: "Examen",
        startTime: exam.date,
        deadline: exam.date,
        importance: exam.importance || 1,
        timezone: examTimezone,
        color: exam.color,
        completed: false,
      });

      // Tareas de estudio por tema
      for (const topic of exam.topics) {
        if (topic.completed) continue; // Saltar completados

        const sessions = Math.ceil(
          topic.estimatedMinutes / this.config.maxFocusTime
        );
        const sessionDuration = Math.min(
          topic.estimatedMinutes,
          this.config.maxFocusTime
        );

        for (let i = 0; i < sessions; i++) {
          const isLastSession = i === sessions - 1;
          const duration = isLastSession
            ? topic.estimatedMinutes - sessionDuration * i
            : sessionDuration;

          tasks.push({
            id: `${exam.id}-${topic.id}-session-${i}`,
            name: `${exam.name}: ${topic.name}${
              sessions > 1 ? ` (${i + 1}/${sessions})` : ""
            }`,
            duration: duration,
            type: "Estudio",
            deadline: exam.date,
            importance: exam.importance || 3,
            energyRequired:
              topic.difficulty && topic.difficulty >= 4 ? "Alta" : "Media",
            parentExam: exam.id,
            topicId: topic.id,
            timezone: examTimezone,
            completed: false,
            color: exam.color,
          });
        }
      }
    }

    return tasks;
  }

  // 📅 Programar tareas
  private scheduleTasksForTDA(
    studyTasks: (Task & { priority: number })[],
    events: (Task & { priority: number })[],
    availableTime: number,
    energyBlocks: EnergyBlock[],
    startTime: string,
    suggestions: string[]
  ): PlannedTask[] {
    const planned: PlannedTask[] = [];
    const startDate = parseTodayTime(startTime, this.timezone);
    let currentTime = startDate;
    let sessionCount = 0;
    let lastExamSubject: string | undefined;

    // Alternar materias
    const tasksBySubject = this.groupBySubject(studyTasks);
    const alternatedTasks = this.alternateSubjects(tasksBySubject);

    let skippedTasks = 0;

    for (const task of alternatedTasks) {
      const timeInMinutes = getMinutesFromStart(currentTime, startDate);
      if (timeInMinutes >= availableTime) {
        skippedTasks++;
        continue;
      }

      const energyBlock = getEnergyBlockForTime(
        currentTime,
        energyBlocks,
        this.timezone
      );

      // Verificar compatibilidad de energía
      if (task.energyRequired === "Alta" && energyBlock?.level === "Baja") {
        if (!this.config.allowLowEnergyStudy) {
          skippedTasks++;
          continue;
        }
        suggestions.push(
          `Considera reprogramar "${task.name}" a un momento de mayor energía.`
        );
      }

      // Transición entre materias
      if (lastExamSubject && task.parentExam !== lastExamSubject) {
        const transitionTime = toISOStringWithTimezone(
          currentTime,
          this.timezone
        );
        planned.push({
          id: `transition-${planned.length}`,
          name: "⏸️ Transición entre materias",
          duration: this.config.taskSwitchPenalty,
          type: "Descanso",
          scheduledTime: transitionTime,
          scheduledTimeDisplay: formatTime(currentTime),
          energyBlock: energyBlock?.level,
          timezone: this.timezone,
          canReschedule: true,
          completed: false,
        });
        currentTime = addMinutes(currentTime, this.config.taskSwitchPenalty);
        sessionCount++;
      }

      // Añadir tarea
      const taskScheduledTime = toISOStringWithTimezone(
        currentTime,
        this.timezone
      );
      const isOptimal =
        !task.energyRequired ||
        task.energyRequired === energyBlock?.level ||
        (task.energyRequired === "Media" && energyBlock?.level === "Alta");

      planned.push({
        ...task,
        scheduledTime: taskScheduledTime,
        scheduledTimeDisplay: formatTime(currentTime),
        energyBlock: energyBlock?.level,
        timezone: this.timezone,
        isOptimal,
        canReschedule: true,
      });
      currentTime = addMinutes(currentTime, task.duration);
      sessionCount++;
      lastExamSubject = task.parentExam;

      // Descansos
      const breakType =
        sessionCount % this.config.maxSessionsBeforeLongBreak === 0
          ? "largo"
          : "corto";
      const breakDuration =
        breakType === "largo" ? this.config.longBreak : this.config.shortBreak;

      const breakEnergy = getEnergyBlockForTime(
        currentTime,
        energyBlocks,
        this.timezone
      );
      const breakScheduledTime = toISOStringWithTimezone(
        currentTime,
        this.timezone
      );
      planned.push({
        id: `break-${planned.length}`,
        name: `🧘 Descanso ${breakType}`,
        duration: breakDuration,
        type: "Descanso",
        scheduledTime: breakScheduledTime,
        scheduledTimeDisplay: formatTime(currentTime),
        energyBlock: breakEnergy?.level,
        timezone: this.timezone,
        canReschedule: false,
        completed: false,
      });
      currentTime = addMinutes(currentTime, breakDuration);
    }

    if (skippedTasks > 0) {
      suggestions.push(
        `${skippedTasks} tareas no pudieron programarse. Considera aumentar el tiempo disponible.`
      );
    }

    // Repasos y eventos
    for (const event of events) {
      if (!event.startTime) continue;

      const eventTimezone = event.timezone || this.timezone;
      const eventTime = parseISOWithTimezone(event.startTime, eventTimezone);
      const reviewDuration = 15;
      const reviewStart = addMinutes(eventTime, -reviewDuration - 10);
      const reviewEnergy = getEnergyBlockForTime(
        reviewStart,
        energyBlocks,
        eventTimezone
      );

      const reviewScheduledTime = toISOStringWithTimezone(
        reviewStart,
        eventTimezone
      );
      planned.push({
        id: `review-${event.id}`,
        name: `🔄 Repaso rápido: ${event.name}`,
        duration: reviewDuration,
        type: "Repaso",
        startTime: reviewScheduledTime,
        scheduledTime: reviewScheduledTime,
        scheduledTimeDisplay: formatTime(reviewStart),
        energyBlock: reviewEnergy?.level,
        timezone: eventTimezone,
        canReschedule: false,
        completed: false,
      });

      planned.push({
        ...event,
        scheduledTime: event.startTime,
        scheduledTimeDisplay: formatTime(eventTime),
        energyBlock: getEnergyBlockForTime(
          eventTime,
          energyBlocks,
          eventTimezone
        )?.level,
        timezone: eventTimezone,
        canReschedule: false,
      });
    }

    return planned.sort((a, b) => {
      const timeA = a.scheduledTime || a.startTime || "";
      const timeB = b.scheduledTime || b.startTime || "";
      const dateA = parseISOWithTimezone(timeA, a.timezone || this.timezone);
      const dateB = parseISOWithTimezone(timeB, b.timezone || this.timezone);
      return dateA.getTime() - dateB.getTime();
    });
  }

  // 📊 Calcular estadísticas
  private calculateStats(tasks: PlannedTask[]) {
    const studyTasks = tasks.filter(
      (t) => t.type === "Estudio" || t.type === "Repaso"
    );
    const breakTasks = tasks.filter((t) => t.type === "Descanso");
    const subjects = new Set(tasks.map((t) => t.parentExam).filter(Boolean));

    const energyDistribution: Record<EnergyLevel, number> = {
      Alta: 0,
      Media: 0,
      Baja: 0,
    };

    studyTasks.forEach((t) => {
      if (t.energyBlock) {
        energyDistribution[t.energyBlock] += t.duration;
      }
    });

    const totalStudyTime = studyTasks.reduce((sum, t) => sum + t.duration, 0);
    const averageSessionLength =
      studyTasks.length > 0 ? totalStudyTime / studyTasks.length : 0;

    return {
      totalStudyTime,
      totalBreakTime: breakTasks.reduce((sum, t) => sum + t.duration, 0),
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.completed).length,
      subjectsCount: subjects.size,
      averageSessionLength: Math.round(averageSessionLength),
      energyDistribution,
    };
  }

  // 🔄 Métodos auxiliares
  private groupBySubject(tasks: Task[]): Map<string, Task[]> {
    const groups = new Map<string, Task[]>();
    for (const task of tasks) {
      const subject = task.parentExam || task.name;
      if (!groups.has(subject)) groups.set(subject, []);
      groups.get(subject)!.push(task);
    }
    return groups;
  }

  private alternateSubjects(tasksBySubject: Map<string, Task[]>): Task[] {
    if (!this.config.varietyBonus) {
      return Array.from(tasksBySubject.values()).flat();
    }

    const result: Task[] = [];
    const subjects = Array.from(tasksBySubject.keys());
    let index = 0;

    while (subjects.length > 0) {
      const subject = subjects[index % subjects.length];
      const tasks = tasksBySubject.get(subject)!;

      if (tasks.length > 0) {
        result.push(tasks.shift()!);
      }

      if (tasks.length === 0) {
        subjects.splice(index % subjects.length, 1);
      } else {
        index++;
      }
    }

    return result;
  }

  private compareEventTimes(
    a: Task & { priority: number },
    b: Task & { priority: number }
  ): number {
    if (a.startTime && b.startTime) {
      const dateA = parseISOWithTimezone(
        a.startTime,
        a.timezone || this.timezone
      );
      const dateB = parseISOWithTimezone(
        b.startTime,
        b.timezone || this.timezone
      );
      return dateA.getTime() - dateB.getTime();
    }
    return 0;
  }

  // 🛠️ Métodos públicos para UI
  updateConfig(newConfig: Partial<TDAConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): TDAConfig {
    return { ...this.config };
  }

  markTaskCompleted(taskId: string, tasks: PlannedTask[]): PlannedTask[] {
    return tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t));
  }

  rescheduleTask(
    taskId: string,
    newTime: string,
    tasks: PlannedTask[]
  ): PlannedTask[] {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1 || !tasks[taskIndex].canReschedule) return tasks;

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      scheduledTime: newTime,
      scheduledTimeDisplay: formatTime(
        parseISOWithTimezone(newTime, this.timezone)
      ),
    };

    return updatedTasks.sort((a, b) => {
      const timeA = a.scheduledTime || a.startTime || "";
      const timeB = b.scheduledTime || b.startTime || "";
      const dateA = parseISOWithTimezone(timeA, a.timezone || this.timezone);
      const dateB = parseISOWithTimezone(timeB, b.timezone || this.timezone);
      return dateA.getTime() - dateB.getTime();
    });
  }
}

// 🧩 Funciones auxiliares
function parseISOWithTimezone(isoString: string, timezone: string): Date {
  if (
    isoString.includes("+") ||
    isoString.includes("Z") ||
    /[+-]\d{2}:\d{2}$/.test(isoString)
  ) {
    return new Date(isoString);
  }
  return new Date(isoString);
}

function parseTodayTime(time: string, timezone: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60000);
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function toISOStringWithTimezone(date: Date, timezone: string): string {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const minutes = String(absOffset % 60).padStart(2, "0");

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${sign}${hours}:${minutes}`;
}

function getMinutesFromStart(current: Date, start: Date): number {
  return (current.getTime() - start.getTime()) / 60000;
}

function getEnergyBlockForTime(
  time: Date,
  blocks: EnergyBlock[],
  timezone: string
): EnergyBlock | undefined {
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(time);
    d.setHours(h, m, 0, 0);
    return d;
  };

  return blocks.find((b) => {
    const start = parseTime(b.start);
    const end = parseTime(b.end);
    return time >= start && time <= end;
  });
}

// 📚 EJEMPLO DE USO
const exams: Exam[] = [
  {
    id: "hist-001",
    name: "Examen de Historia",
    date: "2025-10-23T18:00:00+01:00",
    timezone: "Europe/Madrid",
    importance: 1,
    color: "#FF6B6B",
    topics: [
      {
        id: "t1",
        name: "Revolución Francesa",
        estimatedMinutes: 45,
        difficulty: 3,
        completed: false,
      },
      {
        id: "t2",
        name: "Imperio Napoleónico",
        estimatedMinutes: 40,
        difficulty: 4,
        completed: false,
      },
      {
        id: "t3",
        name: "Restauración Europea",
        estimatedMinutes: 30,
        difficulty: 2,
        completed: false,
      },
    ],
  },
  {
    id: "math-001",
    name: "Examen de Matemáticas",
    date: "2025-10-24T10:00:00+01:00",
    timezone: "Europe/Madrid",
    importance: 2,
    color: "#4ECDC4",
    topics: [
      {
        id: "m1",
        name: "Derivadas",
        estimatedMinutes: 50,
        difficulty: 4,
        completed: false,
      },
      {
        id: "m2",
        name: "Integrales básicas",
        estimatedMinutes: 45,
        difficulty: 5,
        completed: false,
      },
      {
        id: "m3",
        name: "Límites",
        estimatedMinutes: 25,
        difficulty: 3,
        completed: false,
      },
    ],
  },
];

const tasks: Task[] = [
  {
    id: "task-001",
    name: "Leer artículo de filosofía",
    duration: 20,
    type: "Estudio",
    deadline: "2025-10-23T16:00:00+01:00",
    timezone: "Europe/Madrid",
    importance: 3,
    completed: false,
  },
];

const energyBlocks: EnergyBlock[] = [
  { start: "09:00", end: "11:00", level: "Alta" },
  { start: "11:00", end: "14:00", level: "Media" },
  { start: "14:00", end: "16:00", level: "Baja" },
  { start: "16:00", end: "19:00", level: "Media" },
];

// Crear instancia del planificador
const planner = new TDAStudyPlanner(
  {
    maxFocusTime: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  "Europe/Madrid"
);

// Planificar
const result = planner.plan(tasks, exams, 300, energyBlocks, "09:00");

// Mostrar resultado
console.log("📅 PLANIFICACIÓN OPTIMIZADA PARA TDA");
console.log("═".repeat(70));
console.log("📊 ESTADÍSTICAS:");
console.log(`   Tiempo de estudio: ${result.stats.totalStudyTime} min`);
console.log(`   Tiempo de descanso: ${result.stats.totalBreakTime} min`);
console.log(`   Tareas totales: ${result.stats.totalTasks}`);
console.log(`   Materias: ${result.stats.subjectsCount}`);
console.log(`   Sesión promedio: ${result.stats.averageSessionLength} min`);
console.log(`   Distribución energía:`);
console.log(`     - Alta: ${result.stats.energyDistribution.Alta} min`);
console.log(`     - Media: ${result.stats.energyDistribution.Media} min`);
console.log(`     - Baja: ${result.stats.energyDistribution.Baja} min`);

if (result.warnings.length > 0) {
  console.log("⚠️ ADVERTENCIAS:");
  result.warnings.forEach((w) => console.log(`   - ${w}`));
}

if (result.suggestions.length > 0) {
  console.log("💡 SUGERENCIAS:");
  result.suggestions.forEach((s) => console.log(`   - ${s}`));
}

console.log("📋 TAREAS PROGRAMADAS:");
console.log("═".repeat(70));
result.tasks.forEach((task, i) => {
  const icon =
    task.type === "Descanso"
      ? "☕"
      : task.type === "Examen"
      ? "📝"
      : task.type === "Repaso"
      ? "🔄"
      : "📚";
  const optimal = task.isOptimal ? "✓" : "⚠";
  const timeDisplay = task.scheduledTimeDisplay || "N/A";
  console.log(
    `${i + 1}. ${icon} ${optimal} [${timeDisplay}] ${task.name} (${
      task.duration
    } min)`
  );
  console.log(
    `   Energía: ${task.energyBlock || "N/A"} | Reprogramable: ${
      task.canReschedule ? "Sí" : "No"
    }`
  );
});
console.log("═".repeat(70));
