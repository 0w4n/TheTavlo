import {
  type StarterWidget,
  STARTER_OPTIONS,
} from "#features/onBoarding/domain/onBoarding.entity";
import ChoiceCard from "../../molecule/choiceCard/ChoiceCard";

// ─── Paso 3: punto de partida ───────────────────────────────────────────────

export default function StepStarter({
  starter,
  onSelect,
}: {
  starter: StarterWidget;
  onSelect: (value: StarterWidget) => void;
}) {
  return (
    <section aria-labelledby="onboarding-heading">
      <p className="onboarding__eyebrow">Cómo empezar</p>
      <h1 id="onboarding-heading" className="onboarding__title">
        ¿Cómo preferís ver tu espacio al entrar?
      </h1>
      <p className="onboarding__subtitle">
        Vas a poder sumar más vistas después — esto es solo el punto de partida.
      </p>

      <div
        className="onboarding__grid onboarding__grid--two"
        role="group"
        aria-labelledby="onboarding-heading"
      >
        {STARTER_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            icon={option.icon}
            title={option.label}
            description={option.description}
            selected={starter === option.value}
            onSelect={() => onSelect(option.value)}
          />
        ))}
      </div>
    </section>
  );
}
