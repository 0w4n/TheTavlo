/**
 * Aplica, una única vez, el plan armado en `OnboardingPage`: personaliza el
 * panel home (nombre/color/ícono), agrega el widget elegido y — si la
 * persona cargó una— crea su primera tarea.
 *
 * Debe llamarse desde un componente ya montado dentro de `PanelsProvider`,
 * `WidgetsProvider` y `TasksProvider` — hoy, eso es `HomePage` (ver
 * `App.tsx` → `ProviderApp`). No crea un panel nuevo: el panel "home" ya lo
 * provee el flujo normal de login (`PanelsProvider` se suscribe a él apenas
 * hay usuario autenticado) — acá solo lo personalizamos.
 *
 * Si no hay un plan pendiente (login normal, sin pasar por onboarding), el
 * hook no hace nada.
 */
export declare function useOnBoardingBootstrap(): void;
