import { type OnboardingGoal, type FirstTaskDue } from "#features/onBoarding/domain/onBoarding.entity";
export default function StepFirstTask({ goals, title, onTitleChange, due, onDueChange, }: {
    goals: OnboardingGoal[];
    title: string;
    onTitleChange: (value: string) => void;
    due: FirstTaskDue;
    onDueChange: (value: FirstTaskDue) => void;
}): import("react").JSX.Element;
