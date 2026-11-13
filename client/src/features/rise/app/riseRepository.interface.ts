import type { RiseAnswerInput, RiseAnswerResult, RiseDigest } from "../domain/rise.entity";

export interface RiseRepository {
  /** Pendientes de las próximas 24/48 h + decisiones ya tomadas ese día (`dateKey` local). */
  getDigest(dateKey: string): Promise<RiseDigest>;
  /** Registra una decisión SÍ/NO y aplica su efecto en el backend (idempotente). */
  answer(input: RiseAnswerInput): Promise<RiseAnswerResult>;
}
