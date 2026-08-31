import { type OnboardingGoal } from "#features/onBoarding/domain/onBoarding.entity";
export default function StepSpace({ goals, spaceName, onNameChange, nameError, spaceColor, onColorChange, spaceIcon, onIconChange, }: {
    goals: OnboardingGoal[];
    spaceName: string;
    onNameChange: (value: string) => void;
    nameError: string | null;
    spaceColor: number;
    onColorChange: (hue: number) => void;
    spaceIcon: string;
    onIconChange: (icon: string) => void;
}): import("react").JSX.Element;
