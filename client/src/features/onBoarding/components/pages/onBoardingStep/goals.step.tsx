import {
  type OnboardingGoal,
  GOAL_OPTIONS,
} from "#features/onBoarding/domain/onBoarding.entity";
import ChoiceCard from "../../molecule/choiceCard/ChoiceCard";

// ─── Paso 1: objetivo ───────────────────────────────────────────────────────

export default function StepGoals({
  goals,
  onToggle,
}: {
  goals: OnboardingGoal[];
  onToggle: (goal: OnboardingGoal) => void;
}) {
  return (
    <section aria-labelledby="onboarding-heading">
      <p className="onboarding__eyebrow">Antes que nada</p>
      <h1 id="onboarding-heading" className="onboarding__title">
        ¿Qué querés resolver con TheTavlo?
      </h1>
      <p className="onboarding__subtitle">
        Elegí una o más — así armamos tu espacio para vos, no al revés.
      </p>

      <div
        className="onboarding__grid"
        role="group"
        aria-labelledby="onboarding-heading"
      >
        {GOAL_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            icon={option.icon}
            title={option.label}
            description={option.description}
            selected={goals.includes(option.value)}
            onSelect={() => onToggle(option.value)}
          />
        ))}
      </div>
    </section>
  );
}
