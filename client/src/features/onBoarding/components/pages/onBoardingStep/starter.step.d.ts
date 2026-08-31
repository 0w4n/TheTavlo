import { type StarterWidget } from "#features/onBoarding/domain/onBoarding.entity";
export default function StepStarter({ starter, onSelect, }: {
    starter: StarterWidget;
    onSelect: (value: StarterWidget) => void;
}): import("react").JSX.Element;
