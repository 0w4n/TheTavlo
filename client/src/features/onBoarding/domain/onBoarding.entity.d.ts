/**
 * Dominio del onboarding.
 *
 * A propósito NO modela esto como una entidad de Firestore (no tiene
 * repository ni service): el "plan" de onboarding es efímero y vive del
 * lado del cliente. Su único trabajo es viajar de `OnboardingPage`
 * (montada en `/login`, fuera de PanelsProvider/WidgetsProvider) hasta
 * `useOnBoardingBootstrap` (que corre ya autenticado, dentro de esos
 * providers) — ver `onboardingStorage.ts` para el puente entre ambos.
 */
export type OnboardingGoal = "study" | "team" | "personal" | "deadlines" | "exploring";
export interface GoalOption {
    value: OnboardingGoal;
    label: string;
    description: string;
    icon: string;
    /** Si es true, elegirla deselecciona cualquier otro objetivo (y viceversa). */
    exclusive?: boolean;
}
export declare const GOAL_OPTIONS: GoalOption[];
export type StarterWidget = "task-list" | "panels-list";
export interface StarterOption {
    value: StarterWidget;
    label: string;
    description: string;
    icon: string;
}
export declare const STARTER_OPTIONS: StarterOption[];
export declare function suggestStarterWidget(goals: OnboardingGoal[]): StarterWidget;
export interface SpaceColorOption {
    hue: number;
    name: string;
}
export declare const SPACE_COLOR_OPTIONS: SpaceColorOption[];
export interface SpaceIconOption {
    name: string;
    label: string;
}
export declare const SPACE_ICON_OPTIONS: SpaceIconOption[];
export declare const SPACE_NAME_MAX_LENGTH = 15;
export type FirstTaskDue = "today" | "tomorrow" | "week";
export interface OnboardingFirstTask {
    title: string;
    due: FirstTaskDue;
}
export declare const FIRST_TASK_DUE_OPTIONS: {
    value: FirstTaskDue;
    label: string;
}[];
export declare const FIRST_TASK_TITLE_MAX_LENGTH = 100;
export interface OnboardingPlan {
    goals: OnboardingGoal[];
    spaceName: string;
    spaceColor: number;
    spaceIcon: string;
    starterWidget: StarterWidget;
    firstTask: OnboardingFirstTask | null;
    savedAt: string;
}
export declare function suggestSpacePlaceholder(goals: OnboardingGoal[]): string;
export declare function suggestTaskPlaceholder(goals: OnboardingGoal[]): string;
