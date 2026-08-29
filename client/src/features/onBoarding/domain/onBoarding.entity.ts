/**
 * Dominio del onboarding.
 *
 * A propósito NO modela esto como una entidad de Firestore (no tiene
 * repository ni service): el "plan" de onboarding es efímero y vive del
 * lado del cliente. Su único trabajo es viajar de `OnboardingPage`
 * (montada en `/login`, fuera de PanelsProvider/WidgetsProvider) hasta
 * `useOnBoardingBootstrap` (que corre ya autenticado, dentro de esos
 * providers) — ver `onboardingStorage.ts` para el puente entre ambos.
 */

// ─── Objetivos ────────────────────────────────────────────────────────────

export type OnboardingGoal =
  | "study"
  | "team"
  | "personal"
  | "deadlines"
  | "exploring";

export interface GoalOption {
  value: OnboardingGoal;
  label: string;
  description: string;
  icon: string;
  /** Si es true, elegirla deselecciona cualquier otro objetivo (y viceversa). */
  exclusive?: boolean;
}

export const GOAL_OPTIONS: GoalOption[] = [
  {
    value: "study",
    label: "Organizar mis estudios",
    description: "Materias, parciales y trabajos en un solo lugar.",
    icon: "IconSchool",
  },
  {
    value: "team",
    label: "Coordinar un equipo o proyecto",
    description: "Espacios compartidos para avanzar juntos.",
    icon: "IconUsers",
  },
  {
    value: "personal",
    label: "Ordenar mi día a día",
    description: "Lo personal y lo laboral, sin perder nada de vista.",
    icon: "IconSun",
  },
  {
    value: "deadlines",
    label: "No perder ninguna entrega",
    description: "Fechas límite siempre a la vista.",
    icon: "IconClipboardCheck",
  },
  {
    value: "exploring",
    label: "Todavía no lo sé — quiero ver cómo funciona",
    description: "Sin compromiso: armamos algo simple para arrancar.",
    icon: "IconSparkles",
    exclusive: true,
  },
];

// ─── Punto de partida (solo widgets ya disponibles, ver widgetTemplates.ts) ─

export type StarterWidget = "task-list" | "panels-list";

export interface StarterOption {
  value: StarterWidget;
  label: string;
  description: string;
  icon: string;
}

// Íconos alineados a propósito con WIDGET_TEMPLATES (task-list / panels-list)
// para que el widget que aparece en el dashboard se sienta continuo con lo
// que la persona eligió acá, no como una sorpresa distinta.
export const STARTER_OPTIONS: StarterOption[] = [
  {
    value: "task-list",
    label: "Ver mis tareas",
    description: "Una lista clara de lo próximo que tenés que hacer.",
    icon: "IconCheckbox",
  },
  {
    value: "panels-list",
    label: "Organizar por espacios",
    description: "Accesos rápidos a tus distintos proyectos o materias.",
    icon: "IconFolderFilled",
  },
];

export function suggestStarterWidget(goals: OnboardingGoal[]): StarterWidget {
  return goals.includes("team") ? "panels-list" : "task-list";
}

// ─── Personalización del espacio (Panel.color es un hue 0-360, ver panel.entity.ts) ─

export interface SpaceColorOption {
  hue: number;
  name: string;
}

export const SPACE_COLOR_OPTIONS: SpaceColorOption[] = [
  { hue: 152, name: "Verde bosque" },
  { hue: 235, name: "Índigo" },
  { hue: 20, name: "Terracota" },
  { hue: 45, name: "Ámbar" },
  { hue: 280, name: "Violeta" },
  { hue: 340, name: "Rosa" },
];

export interface SpaceIconOption {
  name: string;
  label: string;
}

export const SPACE_ICON_OPTIONS: SpaceIconOption[] = [
  { name: "IconBook2", label: "Estudio" },
  { name: "IconUsers", label: "Equipo" },
  { name: "IconBriefcase", label: "Trabajo" },
  { name: "IconHome", label: "Personal" },
  { name: "IconRocket", label: "Proyecto" },
  { name: "IconTarget", label: "Objetivos" },
];

// PanelRules.validateName rechaza nombres de más de 15 caracteres (el
// mensaje de error dice 50, pero la condición real es 15 — hay un desfasaje
// en panel.rules.ts que vale la pena revisar). Usamos el límite real acá
// para no dejar que alguien llegue al final del onboarding y falle ahí.
export const SPACE_NAME_MAX_LENGTH = 15;

// ─── Primera tarea (opcional) ──────────────────────────────────────────────

export type FirstTaskDue = "today" | "tomorrow" | "week";

export interface OnboardingFirstTask {
  title: string;
  due: FirstTaskDue;
}

export const FIRST_TASK_DUE_OPTIONS: { value: FirstTaskDue; label: string }[] =
  [
    { value: "today", label: "Hoy" },
    { value: "tomorrow", label: "Mañana" },
    { value: "week", label: "Esta semana" },
  ];

export const FIRST_TASK_TITLE_MAX_LENGTH = 100;

// ─── Plan completo ──────────────────────────────────────────────────────────

export interface OnboardingPlan {
  goals: OnboardingGoal[];
  spaceName: string;
  spaceColor: number;
  spaceIcon: string;
  starterWidget: StarterWidget;
  firstTask: OnboardingFirstTask | null;
  savedAt: string;
}

// ─── Copys contextuales ─────────────────────────────────────────────────────

export function suggestSpacePlaceholder(goals: OnboardingGoal[]): string {
  if (goals.includes("team")) return "Ej. Proyecto Q3";
  if (goals.includes("study")) return "Ej. Segundo cuatrimestre";
  if (goals.includes("deadlines")) return "Ej. Entregas de noviembre";
  return "Ej. Mi espacio";
}

export function suggestTaskPlaceholder(goals: OnboardingGoal[]): string {
  if (goals.includes("study")) return "Ej. Repasar el tema 3";
  if (goals.includes("team")) return "Ej. Enviar el brief a diseño";
  if (goals.includes("deadlines")) return "Ej. Entregar el informe mensual";
  return "Ej. Llamar al dentista";
}
