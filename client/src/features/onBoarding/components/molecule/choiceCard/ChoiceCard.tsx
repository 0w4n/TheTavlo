import Icon from "#shared/ui/atoms/icons";

export default function ChoiceCard({
  icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: string;
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={
        "onboarding__choice" + (selected ? " onboarding__choice--selected" : "")
      }
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="onboarding__choice-icon" aria-hidden="true">
        <Icon name={icon} size={26} />
      </span>
      <span className="onboarding__choice-text">
        <span className="onboarding__choice-title">{title}</span>
        {description && (
          <span className="onboarding__choice-description">{description}</span>
        )}
      </span>
      {selected && (
        <span className="onboarding__choice-check" aria-hidden="true">
          <Icon name="IconCheck" size={18} />
        </span>
      )}
    </button>
  );
}
