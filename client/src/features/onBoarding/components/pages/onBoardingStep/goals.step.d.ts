import { type OnboardingGoal } from "#features/onBoarding/domain/onBoarding.entity";
export default function StepGoals({ goals, onToggle, }: {
    goals: OnboardingGoal[];
    onToggle: (goal: OnboardingGoal) => void;
}): import("react").JSX.Element;
