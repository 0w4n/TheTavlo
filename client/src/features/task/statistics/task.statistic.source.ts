import { defineStatisticSource } from "#features/statistic/domain/statistic.types";
import type {
  StatisticContext,
  StatisticDefinition,
} from "#features/statistic/domain/statistic.types";
import { StatisticRules } from "#features/statistic/domain/statistic.rules";
import {
  completionCounts,
  completionsByWeekday,
  completionsPerDay,
  deliveryStreaks,
  dayIndex,
  dueDate,
  dueWithinDays,
  medianAnticipationDays,
  nextDeadlines,
  overdueSummary,
  punctualityCounts,
  startOfDayOffset,
  statusBreakdown,
  workloadByWeek,
  type TaskStatisticsInput,
} from "./taskMetrics";
import { useTaskStatisticsInput } from "./useTaskStatisticsInput";

// ─── Plugin "tasks" ─────────────────────────────────────────────────────────
//
// Este archivo es lo ÚNICO que la Feature "task" le entrega al sistema de
// estadísticas. Se descubre solo (ver statisticDiscovery.ts): para ofrecer una
// estadística nueva basta con agregarla a `statistics` — ningún archivo de
// `features/statistic` cambia.
//
// Convención de ids: "tasks.<nombre>". Se guardan en la config de los widgets,
// así que NO los renombres sin migrar.

type TaskStatistic = StatisticDefinition<TaskStatisticsInput>;

// ─── Formato ────────────────────────────────────────────────────────────────

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const capitalize = (text: string) =>
  text.charAt(0).toLocaleUpperCase() + text.slice(1);

const formatNumber = (n: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n);

/** "hoy" / "mañana" / "en 3 días". */
function formatRelativeDay(due: Date, ctx: StatisticContext): string {
  const diff = dayIndex(due) - dayIndex(ctx.now);
  if (diff <= 0) return "hoy";
  if (diff === 1) return "mañana";
  return `en ${diff} días`;
}

// ─── Estadísticas ───────────────────────────────────────────────────────────

const completionRate: TaskStatistic = {
  id: "tasks.completion-rate",
  title: "Tareas entregadas",
  description:
    "Porcentaje de tus tareas que ya están entregadas sobre el total del panel.",
  icon: "IconChecklist",
  compute(input) {
    const { total, done } = completionCounts(input.tasks);
    if (total === 0) return null;

    const percent = StatisticRules.percent(done, total);

    return {
      kind: "progress",
      value: done,
      total,
      label: `${percent}%`,
      tone: StatisticRules.toneForHigherIsBetter(percent),
      caption: `${done} de ${total} ${plural(total, "tarea", "tareas")} entregadas`,
    };
  },
};

const statusDistribution: TaskStatistic = {
  id: "tasks.status-breakdown",
  title: "Estado de tus tareas",
  description:
    "Cómo se reparten tus tareas: entregadas, en curso, sin empezar y vencidas (no entregadas y con el plazo ya pasado).",
  icon: "IconChartPie",
  compute(input, ctx) {
    if (input.tasks.length === 0) return null;
    const s = statusBreakdown(input.tasks, ctx.now);

    return {
      kind: "distribution",
      slices: [
        { id: "done", label: "Entregadas", value: s.done, tone: "positive" },
        { id: "inProgress", label: "En curso", value: s.inProgress, tone: "info" },
        { id: "notStarted", label: "Sin empezar", value: s.notStarted, tone: "neutral" },
        { id: "overdue", label: "Vencidas", value: s.overdue, tone: "danger" },
      ],
    };
  },
};

const onTimeRate: TaskStatistic = {
  id: "tasks.on-time-rate",
  title: "Entregas a tiempo",
  description:
    "De las tareas que has entregado, qué porcentaje entregaste antes de su fecha límite.",
  icon: "IconClockCheck",
  compute(input) {
    const { done, onTime } = punctualityCounts(input.tasks);
    if (done === 0) return null;

    const percent = StatisticRules.percent(onTime, done);

    return {
      kind: "kpi",
      value: `${percent}%`,
      unit: "a tiempo",
      tone: StatisticRules.toneForHigherIsBetter(percent),
      caption: `${onTime} de ${done} ${plural(done, "entrega", "entregas")}`,
    };
  },
};

const overdue: TaskStatistic = {
  id: "tasks.overdue",
  title: "Tareas vencidas",
  description:
    "Tareas sin entregar cuya fecha límite ya pasó. Se actualiza solo con el paso del tiempo.",
  icon: "IconAlertTriangle",
  compute(input, ctx) {
    if (input.tasks.length === 0) return null;
    const { count, oldestDaysAgo } = overdueSummary(input.tasks, ctx.now);

    if (count === 0) {
      return {
        kind: "kpi",
        value: "0",
        unit: "vencidas",
        tone: "positive",
        caption: "¡Estás al día!",
      };
    }

    const caption =
      oldestDaysAgo === 0
        ? "La más antigua venció hoy"
        : `La más antigua venció hace ${oldestDaysAgo} ${plural(oldestDaysAgo ?? 0, "día", "días")}`;

    return {
      kind: "kpi",
      value: String(count),
      unit: plural(count, "tarea vencida", "tareas vencidas"),
      tone: "danger",
      caption,
    };
  },
};

const typicalAnticipation: TaskStatistic = {
  id: "tasks.typical-anticipation",
  title: "Antelación típica",
  description:
    "Con cuánto tiempo de margen sueles entregar (mediana). Se calcula con la última modificación de cada tarea entregada.",
  icon: "IconHourglass",
  compute(input, ctx) {
    const days = medianAnticipationDays(input.tasks);
    if (days === null) return null;

    const { done } = completionCounts(input.tasks);
    const caption = `Mediana de ${done} ${plural(done, "entrega", "entregas")}`;
    const hours = Math.abs(days) * 24;

    // Menos de un día: las horas dicen más que "0,3 días".
    const useHours = Math.abs(days) < 1;
    const amount = useHours ? Math.round(hours) : Math.round(Math.abs(days) * 10) / 10;
    const unitBase = useHours
      ? plural(amount, "hora", "horas")
      : plural(amount, "día", "días");

    if (amount === 0) {
      return {
        kind: "kpi",
        value: "0",
        unit: "de margen",
        tone: "neutral",
        caption: `Sueles entregar justo en el plazo · ${caption}`,
      };
    }

    const early = days > 0;

    return {
      kind: "kpi",
      value: formatNumber(amount, ctx.locale),
      unit: `${unitBase} ${early ? "antes" : "después"} del plazo`,
      tone: early ? "positive" : "warning",
      caption,
    };
  },
};

const completedLast7Days: TaskStatistic = {
  id: "tasks.completed-last-7-days",
  title: "Entregas de la semana",
  description:
    "Tareas entregadas cada uno de los últimos 7 días, contando hoy.",
  icon: "IconChartBar",
  compute(input, ctx) {
    const counts = completionsPerDay(input.tasks, ctx.now, 7);
    const total = counts.reduce((sum, n) => sum + n, 0);
    if (total === 0) return null;

    const formatter = new Intl.DateTimeFormat(ctx.locale, { weekday: "short" });

    return {
      kind: "series",
      unit: "entregas",
      tone: "info",
      points: counts.map((value, i) => ({
        label: formatter.format(startOfDayOffset(ctx.now, 6 - i)),
        value,
        highlight: i === counts.length - 1,
      })),
      caption: `${total} ${plural(total, "entrega", "entregas")} en los últimos 7 días`,
    };
  },
};

const weeklyComparison: TaskStatistic = {
  id: "tasks.weekly-comparison",
  title: "Esta semana vs. la anterior",
  description:
    "Entregas de los últimos 7 días comparadas con los 7 días anteriores.",
  icon: "IconTrendingUp",
  compute(input, ctx) {
    const counts = completionsPerDay(input.tasks, ctx.now, 14);
    const previous = counts.slice(0, 7).reduce((sum, n) => sum + n, 0);
    const current = counts.slice(7).reduce((sum, n) => sum + n, 0);
    if (current + previous === 0) return null;

    const { direction, delta, tone } = StatisticRules.trend(current, previous);
    const label =
      direction === "flat"
        ? "Igual que la semana anterior"
        : `${delta > 0 ? "+" : "−"}${Math.abs(delta)} vs. semana anterior`;

    return {
      kind: "kpi",
      value: String(current),
      unit: plural(current, "entrega", "entregas"),
      tone: "info",
      caption: "Últimos 7 días",
      trend: { direction, label, tone },
    };
  },
};

const streak: TaskStatistic = {
  id: "tasks.streak",
  title: "Racha de entregas",
  description:
    "Días seguidos en los que has entregado al menos una tarea. Si hoy aún no entregas, la racha sigue viva hasta que acabe el día.",
  icon: "IconFlame",
  compute(input, ctx) {
    const { current, best } = deliveryStreaks(input.tasks, ctx.now);
    if (best === 0) return null;

    const caption =
      current > 0 && current >= best
        ? "¡Es tu mejor racha!"
        : `Tu mejor racha: ${best} ${plural(best, "día", "días")}`;

    return {
      kind: "kpi",
      value: String(current),
      unit: plural(current, "día seguido", "días seguidos"),
      tone: current > 0 ? "positive" : "neutral",
      caption,
    };
  },
};

/** Mínimo de entregas para hablar de "tu día más productivo" sin inventar
 *  una tendencia a partir de 1 o 2 datos. */
const MIN_DELIVERIES_FOR_WEEKDAY = 3;

const busiestWeekday: TaskStatistic = {
  id: "tasks.busiest-weekday",
  title: "Tu día más productivo",
  description:
    "El día de la semana en el que más tareas has entregado. Requiere al menos 3 entregas.",
  icon: "IconCalendarEvent",
  compute(input, ctx) {
    const counts = completionsByWeekday(input.tasks);
    const total = counts.reduce((sum, n) => sum + n, 0);
    if (total < MIN_DELIVERIES_FOR_WEEKDAY) return null;

    // Semana de lunes a domingo: ante un empate gana el día más temprano.
    const order = [1, 2, 3, 4, 5, 6, 0];
    const bestDay = order.reduce((best, day) =>
      counts[day] > counts[best] ? day : best,
    );

    // 7 de enero de 2024 fue domingo → `7 + getDay()` da ese día de la semana.
    const name = new Intl.DateTimeFormat(ctx.locale, { weekday: "long" }).format(
      new Date(2024, 0, 7 + bestDay),
    );

    return {
      kind: "kpi",
      value: capitalize(name),
      tone: "info",
      caption: `${counts[bestDay]} de ${total} entregas`,
    };
  },
};

const WORKLOAD_WEEKS = 4;

const workloadNextWeeks: TaskStatistic = {
  id: "tasks.workload-next-weeks",
  title: "Carga de las próximas semanas",
  description:
    "Tareas pendientes que vencen en cada bloque de 7 días, empezando hoy. Sirve para ver dónde se acumula el trabajo.",
  icon: "IconCalendarStats",
  compute(input, ctx) {
    const counts = workloadByWeek(input.tasks, ctx.now, WORKLOAD_WEEKS);
    const total = counts.reduce((sum, n) => sum + n, 0);
    if (total === 0) return null;

    const busiest = Math.max(...counts);
    const formatter = new Intl.DateTimeFormat(ctx.locale, {
      day: "numeric",
      month: "short",
    });

    return {
      kind: "series",
      unit: "tareas",
      tone: "warning",
      points: counts.map((value, i) => ({
        // Cada barra se etiqueta con el día en que empieza su bloque.
        label: formatter.format(startOfDayOffset(ctx.now, -7 * i)),
        value,
        highlight: value === busiest,
      })),
      caption: "Tareas pendientes que vencen en cada bloque de 7 días",
    };
  },
};

const dueSoon: TaskStatistic = {
  id: "tasks.due-soon",
  title: "Vencen esta semana",
  description:
    "Tareas pendientes cuya fecha límite cae en los próximos 7 días (incluido hoy).",
  icon: "IconCalendarDue",
  compute(input, ctx) {
    if (input.tasks.length === 0) return null;
    const count = dueWithinDays(input.tasks, ctx.now, 7);

    return {
      kind: "kpi",
      value: String(count),
      unit: plural(count, "tarea", "tareas"),
      tone: count === 0 ? "positive" : count >= 5 ? "warning" : "info",
      caption: count === 0 ? "Nada urgente por ahora" : "En los próximos 7 días",
    };
  },
};

const NEXT_DEADLINES_LIMIT = 4;

const upcomingDeadlines: TaskStatistic = {
  id: "tasks.next-deadlines",
  title: "Próximos vencimientos",
  description: "Las tareas pendientes con la fecha límite más cercana.",
  icon: "IconListDetails",
  compute(input, ctx) {
    const next = nextDeadlines(input.tasks, ctx.now, NEXT_DEADLINES_LIMIT);
    if (next.length === 0) return null;

    const dateFormatter = new Intl.DateTimeFormat(ctx.locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      kind: "list",
      items: next.map((task) => {
        const due = dueDate(task);
        const relative = formatRelativeDay(due, ctx);

        return {
          id: task.id,
          label: task.title,
          value: relative,
          hint: dateFormatter.format(due),
          tone: relative === "hoy" || relative === "mañana" ? "warning" : "neutral",
        };
      }),
    };
  },
};

// ─── Fuente ─────────────────────────────────────────────────────────────────

export default defineStatisticSource<TaskStatisticsInput>({
  id: "tasks",
  label: "Tareas",
  icon: "IconChecklist",
  useInput: useTaskStatisticsInput,
  statistics: [
    completionRate,
    statusDistribution,
    onTimeRate,
    overdue,
    typicalAnticipation,
    completedLast7Days,
    weeklyComparison,
    streak,
    busiestWeekday,
    workloadNextWeeks,
    dueSoon,
    upcomingDeadlines,
  ],
});
