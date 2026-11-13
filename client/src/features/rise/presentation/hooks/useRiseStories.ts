import { useCallback, useEffect, useRef, useState } from "react";
import { isErr } from "#core/appCore/domain/AppCore.type";
import type { RiseService } from "../../app/rise.service";
import type { DecisionAnswer, RiseStory, RiseStoryDecision } from "../../domain/rise.entity";
import { RiseRules } from "../../domain/rise.rules";

type RiseState =
  | { status: "loading" }
  | { status: "ready"; stories: RiseStory[] }
  | { status: "error"; message: string };

/**
 * Carga las historias de Rise y gestiona las respuestas SÍ/NO.
 *
 * - Las historias son una FOTO tomada al abrir (no se reconstruyen al
 *   responder), así el índice que el usuario está viendo nunca se desplaza.
 * - `answer` devuelve `true` solo si el backend confirmó la decisión.
 */
export function useRiseStories(service: RiseService, userName: string | null) {
  const [state, setState] = useState<RiseState>({ status: "loading" });
  const [pendingDecisionId, setPendingDecisionId] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const userNameRef = useRef(userName);
  const loadedAtRef = useRef(new Date());
  const inFlightRef = useRef(false);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    loadedAtRef.current = now;
    setState({ status: "loading" });

    void service.loadStories({ now, userName: userNameRef.current }).then((result) => {
      if (cancelled) return;
      setState(
        isErr(result)
          ? { status: "error", message: result.err.message }
          : { status: "ready", stories: result.value },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [service, reloadKey]);

  const answer = useCallback(
    async (decision: RiseStoryDecision, value: DecisionAnswer): Promise<boolean> => {
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      setPendingDecisionId(decision.id);
      setAnswerError(null);

      try {
        const result = await service.answer(
          { kind: decision.kind, answer: value, panelId: decision.panelId, taskId: decision.taskId },
          // Misma fecha local con la que se pidió el digest (aunque pase la medianoche).
          loadedAtRef.current,
        );

        if (isErr(result)) {
          setAnswerError(result.err.message);
          return false;
        }

        setState((prev) =>
          prev.status === "ready"
            ? { status: "ready", stories: RiseRules.applyDecision(prev.stories, result.value, new Date()) }
            : prev,
        );
        return true;
      } finally {
        inFlightRef.current = false;
        setPendingDecisionId(null);
      }
    },
    [service],
  );

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    status: state.status,
    stories: state.status === "ready" ? state.stories : [],
    errorMessage: state.status === "error" ? state.message : null,
    pendingDecisionId,
    answerError,
    answer,
    reload,
  };
}
