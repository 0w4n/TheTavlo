import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";
import type {
  DecisionAnswer,
  RiseStory,
  RiseStoryDecision,
  RiseTaskView,
  RiseUrgency,
} from "#features/rise/domain/rise.entity";
import { RiseRules } from "#features/rise/domain/rise.rules";

// ─── Utilidades de presentación ───────────────────────────────────────────────

/** Etiqueta corta de la historia para el anuncio a lectores de pantalla. */
export function getStoryLabel(story: RiseStory): string {
  switch (story.kind) {
    case "intro":
    case "empty":
      return story.headline;
    case "urgent":
    case "agenda":
      return story.title;
    case "task":
      return story.task.title;
    case "workday":
      return "Reprogramar tu horario de hoy";
    case "outro":
      return story.headline;
  }
}

/** Color de acento de la tarjeta (se traduce a `--rs-accent` vía data-attribute). */
export function getStoryTone(story: RiseStory): string {
  switch (story.kind) {
    case "urgent":
      return "danger";
    case "task":
      return story.task.urgency === "overdue" || story.task.urgency === "urgent"
        ? "danger"
        : story.task.urgency === "soon"
          ? "warn"
          : "brand";
    case "agenda":
      return "info";
    default:
      return "brand";
  }
}

const URGENCY_COPY: Record<RiseUrgency, string> = {
  overdue: "Esto ya venció: dale prioridad hoy.",
  urgent: "Quedan pocas horas. Enfócate solo en esto.",
  soon: "Tienes margen hoy, pero no lo dejes para el final.",
  later: "Aún tienes tiempo: adelanta lo que puedas.",
};

const URGENCY_ICON: Record<RiseUrgency, string> = {
  overdue: "IconFlame",
  urgent: "IconAlertTriangle",
  soon: "IconClock",
  later: "IconCalendarEvent",
};

// ─── Bloque SÍ / NO ───────────────────────────────────────────────────────────

interface DecisionBlockProps {
  decision: RiseStoryDecision;
  pending: boolean;
  pendingAnswer: DecisionAnswer | null;
  error: string | null;
  now: Date;
  onAnswer: (decision: RiseStoryDecision, answer: DecisionAnswer) => void;
}

/**
 * Las ÚNICAS opciones son "Sí" y "No". Una vez respondida, los botones se
 * reemplazan por el resultado (no se puede responder dos veces).
 */
function DecisionBlock({ decision, pending, pendingAnswer, error, now, onAnswer }: DecisionBlockProps) {
  const outcome = RiseRules.describeOutcome(decision, now);

  if (outcome) {
    return (
      <div className={`rise-outcome rise-outcome--${outcome.tone}`} data-result data-no-nav role="status">
        <span className="rise-outcome__icon" aria-hidden="true">
          <Icon name={outcome.tone === "yes" ? "IconCheck" : "IconX"} className="" />
        </span>
        <div className="rise-outcome__text">
          <strong>{outcome.title}</strong>
          <span>{outcome.detail}</span>
        </div>
      </div>
    );
  }

  const questionId = `rise-q-${decision.id}`;
  return (
    <div className="rise-decision" data-anim data-no-nav data-decision-id={decision.id} role="group" aria-labelledby={questionId}>
      <p id={questionId} className="rise-decision__question">
        {decision.question}
      </p>
      {decision.hint && <p className="rise-decision__hint">{decision.hint}</p>}
      <div className="rise-decision__actions">
        <Button
          variant="primary"
          size="lg"
          label="Sí"
          className="rise-decision__btn"
          data-answer="yes"
          disabled={pending}
          isLoading={pending && pendingAnswer === "yes"}
          onClick={() => onAnswer(decision, "yes")}
        />
        <Button
          variant="secondary"
          size="lg"
          label="No"
          className="rise-decision__btn"
          data-answer="no"
          disabled={pending}
          isLoading={pending && pendingAnswer === "no"}
          onClick={() => onAnswer(decision, "no")}
        />
      </div>
      <p className="rise-decision__keys" aria-hidden="true">
        Atajos: <kbd>S</kbd> sí · <kbd>N</kbd> no
      </p>
      {error && (
        <p className="rise-decision__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Piezas reutilizables ─────────────────────────────────────────────────────

function Kicker({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="rise-card__kicker" data-anim>
      <Icon name={icon} className="" />
      <span>{children}</span>
    </p>
  );
}

function TaskRow({ task }: { task: RiseTaskView }) {
  return (
    <li className={`rise-row rise-row--${task.urgency}`} data-anim>
      <span className="rise-row__dot" aria-hidden="true" />
      <div className="rise-row__body">
        <strong>{task.title}</strong>
        <small>
          {task.panelName} · {task.dueLabel}
        </small>
      </div>
    </li>
  );
}

// ─── Tarjeta ──────────────────────────────────────────────────────────────────

interface StoryCardProps {
  story: RiseStory;
  now: Date;
  pendingDecisionId: string | null;
  pendingAnswer: DecisionAnswer | null;
  answerError: string | null;
  onAnswer: (decision: RiseStoryDecision, answer: DecisionAnswer) => void;
  onClose: () => void;
}

export function StoryCard({
  story,
  now,
  pendingDecisionId,
  pendingAnswer,
  answerError,
  onAnswer,
  onClose,
}: StoryCardProps) {
  const decisionProps = (decision: RiseStoryDecision) => ({
    decision,
    pending: pendingDecisionId === decision.id,
    pendingAnswer,
    error: pendingDecisionId === null ? answerError : null,
    now,
    onAnswer,
  });

  switch (story.kind) {
    case "intro":
      return (
        <>
          <Kicker icon="IconSunrise">{story.greeting}</Kicker>
          <h2 className="rise-card__title rise-card__title--xl" data-anim>
            {story.headline}
          </h2>
          <p className="rise-card__lead" data-anim>
            {story.subline}
          </p>
          <ul className="rise-stats" data-anim>
            <li>
              <strong data-count={story.stats.tasks}>{story.stats.tasks}</strong>
              <span>{story.stats.tasks === 1 ? "entrega" : "entregas"}</span>
            </li>
            <li>
              <strong data-count={story.stats.events}>{story.stats.events}</strong>
              <span>{story.stats.events === 1 ? "evento" : "eventos"}</span>
            </li>
            <li className={story.stats.urgent > 0 ? "rise-stats__hot" : undefined}>
              <strong data-count={story.stats.urgent}>{story.stats.urgent}</strong>
              <span>{story.stats.urgent === 1 ? "urgente" : "urgentes"}</span>
            </li>
          </ul>
          <p className="rise-card__hint" data-anim>
            Toca el borde derecho o desliza para continuar
          </p>
        </>
      );

    case "empty":
      return (
        <>
          <Kicker icon="IconSparkles">{story.greeting}</Kicker>
          <h2 className="rise-card__title rise-card__title--xl" data-anim>
            {story.headline}
          </h2>
          <p className="rise-card__lead" data-anim>
            {story.subline}
          </p>
          <div className="rise-card__cta" data-anim data-no-nav>
            <Button variant="primary" size="lg" label="Cerrar" className="rise-card__cta-btn" onClick={onClose} />
          </div>
        </>
      );

    case "urgent":
      return (
        <>
          <Kicker icon="IconAlertTriangle">Prioridad</Kicker>
          <h2 className="rise-card__title" data-anim>
            {story.title}
          </h2>
          <p className="rise-card__lead" data-anim>
            {story.subtitle}
          </p>
          <ul className="rise-list">
            {story.tasks.map((task) => (
              <TaskRow key={`${task.panelId}:${task.id}`} task={task} />
            ))}
          </ul>
        </>
      );

    case "task":
      return (
        <>
          <Kicker icon="IconChecklist">{story.task.panelName}</Kicker>
          <h2 className="rise-card__title" data-anim>
            {story.task.title}
          </h2>
          <p className={`rise-chip rise-chip--${story.task.urgency}`} data-anim>
            <Icon name={URGENCY_ICON[story.task.urgency]} className="" />
            <span>{story.task.dueLabel}</span>
          </p>
          <p className="rise-card__lead" data-anim>
            {story.task.progress === "inProgress" ? "Ya empezaste, ¡sigue así! " : "Aún no la has empezado. "}
            {URGENCY_COPY[story.task.urgency]}
          </p>
          {story.decision && <DecisionBlock {...decisionProps(story.decision)} />}
        </>
      );

    case "agenda":
      return (
        <>
          <Kicker icon="IconCalendarEvent">Agenda</Kicker>
          <h2 className="rise-card__title" data-anim>
            {story.title}
          </h2>
          <ul className="rise-list">
            {story.events.map((event) => (
              <li key={`${event.panelId}:${event.id}`} className="rise-row rise-row--event" data-anim>
                <span className="rise-row__time">
                  <small>{event.dayLabel}</small>
                  <strong>{event.timeLabel}</strong>
                </span>
                <div className="rise-row__body">
                  <strong>{event.name}</strong>
                  <small>{event.location ? `${event.location} · ${event.panelName}` : event.panelName}</small>
                </div>
              </li>
            ))}
          </ul>
        </>
      );

    case "workday":
      return (
        <>
          <Kicker icon="IconCalendarTime">Tu jornada</Kicker>
          <h2 className="rise-card__title" data-anim>
            {story.pendingToday === 1
              ? "Tienes 1 entrega en las próximas 24 h"
              : `Tienes ${story.pendingToday} entregas en las próximas 24 h`}
          </h2>
          <DecisionBlock {...decisionProps(story.decision)} />
        </>
      );

    case "outro":
      return (
        <>
          <Kicker icon="IconRocket">Listo</Kicker>
          <h2 className="rise-card__title rise-card__title--xl" data-anim>
            {story.headline}
          </h2>
          <p className="rise-card__lead" data-anim>
            {story.message}
          </p>
          {story.plan && story.plan.length > 0 && (
            <ul className="rise-list rise-list--plan" aria-label="Tu plan de trabajo de hoy">
              {story.plan.map((block) => (
                <li key={`${block.panelId}:${block.taskId}`} className="rise-row rise-row--plan" data-anim>
                  <span className="rise-row__time">
                    <strong>{RiseRules.blockTimeLabel(block)}</strong>
                  </span>
                  <div className="rise-row__body">
                    <strong>{block.title}</strong>
                    <small>{block.atRisk ? "Llegas justo: empieza ya" : block.panelName}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="rise-card__cta" data-anim data-no-nav>
            <Button variant="primary" size="lg" label="Empezar el día" className="rise-card__cta-btn" onClick={onClose} />
          </div>
        </>
      );
  }
}
