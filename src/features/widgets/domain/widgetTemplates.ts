import type { WidgetType } from "./widget.entity";

export interface WidgetTemplate {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  category: "tasks" | "events" | "exams" | "productivity" | "other";
  isHome: boolean
  defaultConfig: Record<string, any>;
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: "task-list",
    title: "Lista de Tareas",
    description: "Visualiza tus tareas en formato lista",
    icon: "✓",
    category: "tasks",
    isHome: false,
    defaultConfig: {
      showCompleted: false,
      sortBy: "dueDate",
      filterPriority: null,
    },
  },
  {
    type: "event-calendar",
    title: "Calendario",
    description: "Vista de calendario mensual",
    icon: "📅",
    category: "events",
    isHome: true,
    defaultConfig: {
      view: "month",
      showWeekends: true,
    },
  },
  {
    type: "event-list",
    title: "Próximos Eventos",
    description: "Lista de eventos ordenados por fecha",
    icon: "📆",
    category: "events",
    isHome: true,
    defaultConfig: {
      daysAhead: 7,
    },
  },
  {
    type: "exam-timeline",
    title: "Timeline de Exámenes",
    description: "Línea de tiempo de próximos exámenes",
    icon: "📝",
    category: "exams",
    isHome: true,
    defaultConfig: {
      daysAhead: 30,
    },
  },
  {
    type: "exam-countdown",
    title: "Contador de Examen",
    description: "Cuenta regresiva para próximo examen",
    icon: "⏰",
    category: "exams",
    isHome: true,
    defaultConfig: {
      showNextExam: true,
    },
  },
  {
    type: "statistics",
    title: "Estadísticas",
    description: "Resumen de tu productividad",
    icon: "📊",
    category: "productivity",
    isHome: true,
    defaultConfig: {
      period: "week",
    },
  },
  {
    type: "quick-add",
    title: "Añadir Rápido",
    description: "Crea tareas/eventos rápidamente",
    icon: "➕",
    category: "other",
    isHome: true,
    defaultConfig: {},
  },
  {
    type: "recent-activity",
    title: "Actividad Reciente",
    description: "Últimas acciones realizadas",
    icon: "🕒",
    category: "other",
    isHome: true,
    defaultConfig: {
      limit: 10,
    },
  },
  {
    type: "upcoming-deadlines",
    title: "Próximos Vencimientos",
    description: "Alertas de fechas límite",
    icon: "⚠️",
    category: "productivity",
    isHome: true,
    defaultConfig: {
      daysAhead: 3,
    },
  },
  {
    type: "productivity-chart",
    title: "Gráfico de Productividad",
    description: "Visualiza tu progreso",
    icon: "📈",
    category: "productivity",
    isHome: true,
    defaultConfig: {
      chartType: "line",
      period: "week",
    },
  },
  {
    type: "notes",
    title: "Notas Rápidas",
    description: "Bloc de notas del panel",
    icon: "📝",
    category: "other",
    isHome: true,
    defaultConfig: {
      content: "",
    },
  },
  {
    type: "panels-list",
    title: "Lista de Paneles",
    description: "Acceso rápido a tus paneles",
    icon: "🗂️",
    category: "other",
    isHome: true,
    defaultConfig: {
      showIcons: true,
    },
  }
];
