import { Input } from "#components/atoms/input";
import {
  type OnboardingGoal,
  type FirstTaskDue,
  suggestTaskPlaceholder,
  FIRST_TASK_TITLE_MAX_LENGTH,
  FIRST_TASK_DUE_OPTIONS,
} from "#features/onBoarding/domain/onBoarding.entity";

// ─── Paso 4: primera tarea (opcional) ──────────────────────────────────────

export default function StepFirstTask({
  goals,
  title,
  onTitleChange,
  due,
  onDueChange,
}: {
  goals: OnboardingGoal[];
  title: string;
  onTitleChange: (value: string) => void;
  due: FirstTaskDue;
  onDueChange: (value: FirstTaskDue) => void;
}) {
  return (
    <section aria-labelledby="onboarding-heading">
      <p className="onboarding__eyebrow">Casi listo</p>
      <h1 id="onboarding-heading" className="onboarding__title">
        ¿Qué es lo primero que tenés que hacer?
      </h1>
      <p className="onboarding__subtitle">
        Totalmente opcional — pero ver algo real ahí adentro ayuda a arrancar.
        Podés saltear este paso.
      </p>

      <div className="onboarding__field">
        <Input
          label="Tu primera tarea (opcional)"
          placeholder={suggestTaskPlaceholder(goals)}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={FIRST_TASK_TITLE_MAX_LENGTH}
          autoFocus
        />
      </div>

      {title.trim().length > 0 && (
        <fieldset className="onboarding__subgroup">
          <legend className="onboarding__legend">¿Para cuándo?</legend>
          <div className="onboarding__chips">
            {FIRST_TASK_DUE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  "onboarding__chip" +
                  (due === option.value ? " onboarding__chip--selected" : "")
                }
                aria-pressed={due === option.value}
                onClick={() => onDueChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
}
