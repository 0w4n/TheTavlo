import { useEffect, useRef } from "react";
import { Timestamp } from "firebase/firestore";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import useTasks from "#features/task/presentation/hooks/useTask";
import useAnnounce from "#core/a11y/useAnnounce";
import { TaskPhase, TaskProgress } from "#features/task/domain/task.entity";
import { clearPendingOnboarding, readPendingOnboarding, } from "../../infraestructure/onBoardingStorage";
function dueDateFrom(due) {
    const date = new Date();
    if (due === "tomorrow")
        date.setDate(date.getDate() + 1);
    if (due === "week")
        date.setDate(date.getDate() + 7);
    date.setHours(23, 59, 0, 0);
    return Timestamp.fromDate(date);
}
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
export function useOnBoardingBootstrap() {
    const { state: panelsState, updatePanel } = usePanels();
    const { addWidget } = useWidgets();
    const { createTask } = useTasks();
    const announce = useAnnounce();
    const appliedRef = useRef(false);
    useEffect(() => {
        if (appliedRef.current)
            return;
        if (panelsState.status !== "panel")
            return;
        const plan = readPendingOnboarding();
        if (!plan)
            return;
        appliedRef.current = true;
        const panelId = panelsState.currentPanel.id;
        (async () => {
            try {
                if (plan.spaceName) {
                    await updatePanel(panelId, {
                        name: plan.spaceName,
                        color: plan.spaceColor,
                        icon: plan.spaceIcon,
                    });
                }
                await addWidget(plan.starterWidget);
                if (plan.firstTask?.title) {
                    const now = Timestamp.now();
                    await createTask([
                        {
                            title: plan.firstTask.title,
                            openAt: null,
                            endAt: dueDateFrom(plan.firstTask.due),
                            createdAt: now,
                            updatedAt: now,
                            progress: TaskProgress.NOTSTARTED,
                            phase: TaskPhase.PLANNED,
                            submission: null,
                        },
                    ]);
                }
                announce(plan.spaceName
                    ? `Tu espacio "${plan.spaceName}" está listo.`
                    : "Tu espacio está listo.");
            }
            catch (error) {
                // No relanzamos: si algo de esto falla, la persona ya está adentro
                // de la app y puede personalizar todo a mano. Un onboarding roto no
                // debería tumbar el dashboard.
                console.error("No se pudo aplicar el plan de onboarding:", error);
            }
            finally {
                clearPendingOnboarding();
            }
        })();
    }, [panelsState, updatePanel, addWidget, createTask, announce]);
}
