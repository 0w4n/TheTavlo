import type {
  DecisionAnswer,
  RiseStory,
  RiseStoryDecision,
} from "#features/rise/domain/rise.entity";

export interface RiseStoriesProps {
  status: "loading" | "ready" | "error";
  stories: RiseStory[];
  errorMessage: string | null;
  /** Error de la última respuesta SÍ/NO que no se pudo guardar. */
  answerError: string | null;
  /** Id de la decisión que se está guardando ahora mismo (deshabilita sus botones). */
  pendingDecisionId: string | null;
  /** Debe resolver `true` solo si la respuesta quedó guardada. */
  onAnswer: (decision: RiseStoryDecision, answer: DecisionAnswer) => Promise<boolean>;
  onRetry: () => void;
  onClose: () => void;
}
