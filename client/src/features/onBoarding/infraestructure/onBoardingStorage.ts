import type { OnboardingPlan } from "../domain/onBoarding.entity";

const STORAGE_KEY = "tavlo:onboarding:pending";

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

export function savePendingOnboarding(
  plan: Omit<OnboardingPlan, "savedAt">,
): void {
  try {
    const payload: OnboardingPlan = {
      ...plan,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Modo privado, cuota llena, etc. No es crítico: en el peor caso el
    // usuario no ve su espacio personalizado al llegar a /home, pero el
    // resto del onboarding (y el login) funciona igual.
  }
}

export function readPendingOnboarding(): OnboardingPlan | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingPlan;
  } catch {
    return null;
  }
}

export function clearPendingOnboarding(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
