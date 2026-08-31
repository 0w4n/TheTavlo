import type { OnboardingPlan } from "../domain/onBoarding.entity";
/**
 * `OnboardingPage` vive en la ruta `/login`, fuera de `PanelsProvider` /
 * `WidgetsProvider` / `TasksProvider` (esos solo existen dentro de
 * `ProtectedLayout`, ver App.tsx). Por eso no puede llamar a `usePanels()`
 * ni `useWidgets()` directamente para aplicar lo que la persona eligió.
 *
 * localStorage es el puente más simple entre ambos mundos: la página de
 * onboarding guarda acá el plan a medida que se completa cada paso, y
 * `useOnBoardingBootstrap` (que sí corre dentro del árbol autenticado, desde
 * `HomePage`) lo lee una vez que el panel real existe, lo aplica, y lo borra.
 *
 * Nota: esto es una app real corriendo en el navegador de la persona (no un
 * artifact de Claude.ai) — localStorage es la herramienta correcta acá.
 */
export declare function savePendingOnboarding(plan: Omit<OnboardingPlan, "savedAt">): void;
export declare function readPendingOnboarding(): OnboardingPlan | null;
export declare function clearPendingOnboarding(): void;
