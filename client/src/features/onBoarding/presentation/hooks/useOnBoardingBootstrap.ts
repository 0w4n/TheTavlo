import { useEffect, useRef } from "react";
import { Timestamp } from "firebase/firestore";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import useAnnounce from "#core/a11y/useAnnounce";
import { ReturnType } from "#features/panels/presentation/context/panelsContext.types";
import {
  clearPendingOnboarding,
  readPendingOnboarding,
} from "../../infraestructure/onBoardingStorage";
/** Crea el panel hijo del onboarding cuando ya existe una sesión autenticada. */
export function useOnBoardingBootstrap(): void {
  const { state: panelsState, createPanel } = usePanels();
  const announce = useAnnounce();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    if (panelsState.status !== "panel") return;

    const plan = readPendingOnboarding();
    if (!plan) return;

    appliedRef.current = true;
    (async () => {
      try {
        const now = Timestamp.now();
        await createPanel(
          {
            parentId: null,
            name: plan.panelName,
            color: plan.panelColor,
            icon: plan.panelIcon,
            sharedWith: null,
            createdAt: now,
            updatedAt: now,
          },
          { addToParent: true, return: ReturnType.DEFAULT },
        );
        announce(`Tu panel "${plan.panelName}" está listo.`);
      } catch (error) {
        // No relanzamos: si algo de esto falla, la persona ya está adentro
        // de la app y puede personalizar todo a mano. Un onboarding roto no
        // debería tumbar el dashboard.
        console.error("No se pudo crear el panel del onboarding:", error);
      } finally {
        clearPendingOnboarding();
      }
    })();
  }, [panelsState, createPanel, announce]);
}
