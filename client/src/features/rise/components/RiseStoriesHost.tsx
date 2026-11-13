import { useMemo } from "react";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { RiseStories } from "./riseStories";
import { RiseService } from "../app/rise.service";
import { TrpcRiseRepository } from "../infrastructure/riseRepository.trpc";
import { useRiseStories } from "../presentation/hooks/useRiseStories";

function firstNameOf(displayName: string | null | undefined): string | null {
  const first = displayName?.trim().split(/\s+/)[0];
  return first ? first : null;
}

/**
 * Contenedor de la feature: conecta el servicio/datos con el visor
 * presentacional `RiseStories`. No necesita Provider propio: Rise agrega
 * datos de TODOS los paneles del usuario vía tRPC, así que no depende del
 * panel activo ni de TasksContext.
 */
export function RiseStoriesHost({ onClose }: { onClose: () => void }) {
  const { state: auth } = useAuth();
  const userName = auth.status === "authenticated" ? firstNameOf(auth.user.displayName) : null;

  const service = useMemo(() => new RiseService(new TrpcRiseRepository()), []);
  const rise = useRiseStories(service, userName);

  return (
    <RiseStories
      status={rise.status}
      stories={rise.stories}
      errorMessage={rise.errorMessage}
      answerError={rise.answerError}
      pendingDecisionId={rise.pendingDecisionId}
      onAnswer={rise.answer}
      onRetry={rise.reload}
      onClose={onClose}
    />
  );
}
