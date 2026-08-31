import { Input } from "#components/atoms/input";
import { type OnboardingGoal, suggestSpacePlaceholder, SPACE_NAME_MAX_LENGTH, SPACE_COLOR_OPTIONS, SPACE_ICON_OPTIONS } from "#features/onBoarding/domain/onBoarding.entity";
import Icon from "#shared/ui/atoms/icons";

// ─── Paso 2: personalizar el espacio ───────────────────────────────────────

export default function StepSpace({
  goals,
  spaceName,
  onNameChange,
  nameError,
  spaceColor,
  onColorChange,
  spaceIcon,
  onIconChange,
}: {
  goals: OnboardingGoal[];
  spaceName: string;
  onNameChange: (value: string) => void;
  nameError: string | null;
  spaceColor: number;
  onColorChange: (hue: number) => void;
  spaceIcon: string;
  onIconChange: (icon: string) => void;
}) {
  return (
    <section aria-labelledby="onboarding-heading">
      <p className="onboarding__eyebrow">Tu espacio</p>
      <h1 id="onboarding-heading" className="onboarding__title">
        Ponele un nombre a tu espacio
      </h1>
      <p className="onboarding__subtitle">
        Ya elegimos un color y un ícono por vos — tocalos solo si preferís
        otros. El nombre lo podés cambiar cuando quieras.
      </p>

      <div className="onboarding__field">
        <Input
          label="Nombre del espacio"
          placeholder={suggestSpacePlaceholder(goals)}
          value={spaceName}
          onChange={(event) => onNameChange(event.target.value)}
          errorMessage={nameError ?? undefined}
          maxLength={SPACE_NAME_MAX_LENGTH}
          autoFocus
          required
        />
      </div>

      <fieldset className="onboarding__subgroup">
        <legend className="onboarding__legend">Color</legend>
        <div className="onboarding__swatches">
          {SPACE_COLOR_OPTIONS.map((color) => (
            <button
              key={color.hue}
              type="button"
              className={
                "onboarding__swatch" +
                (spaceColor === color.hue
                  ? " onboarding__swatch--selected"
                  : "")
              }
              style={{ backgroundColor: `hsl(${color.hue}, 70%, 55%)` }}
              aria-pressed={spaceColor === color.hue}
              aria-label={color.name}
              onClick={() => onColorChange(color.hue)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="onboarding__subgroup">
        <legend className="onboarding__legend">Ícono</legend>
        <div className="onboarding__icons">
          {SPACE_ICON_OPTIONS.map((icon) => (
            <button
              key={icon.name}
              type="button"
              className={
                "onboarding__icon-btn" +
                (spaceIcon === icon.name
                  ? " onboarding__icon-btn--selected"
                  : "")
              }
              aria-pressed={spaceIcon === icon.name}
              aria-label={icon.label}
              onClick={() => onIconChange(icon.name)}
            >
              <Icon name={icon.name} size={22} />
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
