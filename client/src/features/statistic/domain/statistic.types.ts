// Contrato del sistema de estadísticas — capa de dominio.
//
// Solo tipos (y un helper de identidad): nada de aquí toca React ni Vite en
// runtime. Misma filosofía que `widgetDefinition.types.ts`:
//
//   • Una Feature (el "plugin": tareas, eventos, horario...) declara UNA
//     `StatisticSource` en su propia carpeta `statistics/*.statistic.source.ts`.
//   • La Feature decide QUÉ estadísticas ofrece y CÓMO se calculan.
//   • El host (`features/statistic`) solo sabe PINTAR resultados normalizados
//     (`StatisticResult`) — no conoce ninguna Feature concreta.
//
// Así, agregar estadísticas de eventos mañana es crear un archivo en
// `features/events/statistics/`, sin tocar `features/statistic`.

/** Tono semántico. El host lo traduce a color con los tokens del tema. */
export type StatisticTone =
  | "neutral"
  | "positive"
  | "warning"
  | "danger"
  | "info";

// ─── Entrada de datos del plugin ────────────────────────────────────────────

/**
 * Estado de la fuente de datos del plugin. Es lo que devuelve `useInput()`.
 * El plugin lo arma a partir de SU contexto (p. ej. `useTasks()`), así el host
 * nunca importa el contexto de ninguna Feature.
 */
export type StatisticInputState<TInput> =
  | { status: "loading" }
  | { status: "error"; message?: string }
  | { status: "ready"; data: TInput };

/** Contexto que el host le pasa a cada `compute` (determinista y testeable). */
export interface StatisticContext {
  /** "Ahora". Se inyecta para poder testear sin `Date.now()` y refrescar
   *  las estadísticas dependientes del tiempo (p. ej. "vencidas"). */
  now: Date;
  /** Locale BCP-47 para formatear fechas y números. */
  locale: string;
}

// ─── Resultados normalizados (lo que el host sabe dibujar) ──────────────────

/** Un número grande con contexto. Ej.: "3 · tareas vencidas". */
export interface KpiResult {
  kind: "kpi";
  value: string;
  unit?: string;
  caption?: string;
  tone?: StatisticTone;
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
    tone: StatisticTone;
  };
}

/** Avance hacia un total (anillo). Ej.: 12 de 20 tareas entregadas. */
export interface ProgressResult {
  kind: "progress";
  value: number;
  total: number;
  /** Texto dentro del anillo; por defecto, el porcentaje. */
  label?: string;
  caption?: string;
  tone?: StatisticTone;
}

export interface DistributionSlice {
  id: string;
  label: string;
  value: number;
  tone: StatisticTone;
}

/** Reparto de un total entre categorías (barra apilada + leyenda). */
export interface DistributionResult {
  kind: "distribution";
  slices: DistributionSlice[];
  caption?: string;
}

export interface SeriesPoint {
  label: string;
  value: number;
  /** Marca el punto actual / más relevante (se dibuja resaltado). */
  highlight?: boolean;
}

/** Valores a lo largo de categorías ordenadas (barras). Ej.: entregas/día. */
export interface SeriesResult {
  kind: "series";
  points: SeriesPoint[];
  /** Unidad para lectores de pantalla y tooltips ("tareas", "entregas"...). */
  unit?: string;
  caption?: string;
  tone?: StatisticTone;
}

export interface ListItem {
  id: string;
  label: string;
  /** Valor corto a la derecha ("mañana", "3 días"). */
  value?: string;
  /** Texto secundario bajo la etiqueta. */
  hint?: string;
  tone?: StatisticTone;
}

/** Lista corta ordenada. Ej.: próximos vencimientos. */
export interface ListResult {
  kind: "list";
  items: ListItem[];
  caption?: string;
}

export type StatisticResult =
  | KpiResult
  | ProgressResult
  | DistributionResult
  | SeriesResult
  | ListResult;

export type StatisticKind = StatisticResult["kind"];

// ─── Definición de una estadística y de una fuente (plugin) ─────────────────

export interface StatisticDefinition<TInput = unknown> {
  /** Único en TODA la app. Convención: `{source}.{nombre}`; se persiste en
   *  la config de los widgets, así que debe ser estable. */
  id: string;
  title: string;
  /** Qué mide y cómo se calcula (se muestra como ayuda). */
  description: string;
  /** Nombre de ícono Tabler (`IconXxx`), como en `WidgetMetadata.icon`. */
  icon: string;
  /**
   * Cálculo PURO. Devuelve `null` cuando todavía no hay datos suficientes
   * para que la estadística tenga sentido; el host muestra un estado vacío.
   *
   * Está declarado con sintaxis de método a propósito (bivariante): permite
   * que `StatisticDefinition<TaskInput>` sea asignable al registro genérico.
   */
  compute(input: TInput, ctx: StatisticContext): StatisticResult | null;
}

export interface StatisticSource<TInput = unknown> {
  /** Único en la app: "tasks", "events"... */
  id: string;
  label: string;
  icon: string;
  /**
   * Hook que entrega los datos crudos del plugin. El host lo llama siempre
   * desde un componente con `key={source.id}`, de modo que la identidad del
   * hook es estable (cumple las reglas de hooks).
   */
  useInput: () => StatisticInputState<TInput>;
  statistics: StatisticDefinition<TInput>[];
}

/**
 * Helper de identidad para que el plugin tipe su fuente con SU `TInput` y el
 * host la almacene sin genéricos. Se borra a una simple asignación.
 */
export function defineStatisticSource<TInput>(
  source: StatisticSource<TInput>,
): StatisticSource {
  return source as unknown as StatisticSource;
}
