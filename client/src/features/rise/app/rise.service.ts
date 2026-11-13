import {
  err,
  firebaseErr,
  networkErr,
  ok,
  validationErr,
  type AppErr,
  type ResultApp,
} from "#core/appCore/domain/AppCore.type";
import { TRPCRequestError } from "#core/appCore/infrastructure/api/trpcClient";
import type { RiseAnswerInput, RiseAnswerResult, RiseStory } from "../domain/rise.entity";
import { RiseRules } from "../domain/rise.rules";
import type { RiseRepository } from "./riseRepository.interface";

export interface LoadStoriesParams {
  now: Date;
  userName: string | null;
}

function toAppErr(error: unknown, fallback: string): AppErr {
  if (error instanceof TRPCRequestError) {
    if (error.httpStatus === 0) return networkErr(error.message);
    if (error.trpcCode === "BAD_REQUEST") return validationErr(error.message);
    return firebaseErr(error.message || fallback);
  }
  return firebaseErr(error instanceof Error ? error.message : fallback);
}

export class RiseService {
  constructor(private repository: RiseRepository) {}

  /** Trae el digest y lo convierte en historias listas para pintar. */
  async loadStories({ now, userName }: LoadStoriesParams): Promise<ResultApp<RiseStory[], AppErr>> {
    try {
      const digest = await this.repository.getDigest(RiseRules.toDateKey(now));
      return ok(RiseRules.buildStories({ digest, now, userName }));
    } catch (error) {
      return err(toAppErr(error, "No pudimos preparar tu repaso del día"));
    }
  }

  /** Responde un SÍ/NO. `dateKey` se deriva de `now` para que coincida con el del digest. */
  async answer(
    input: Omit<RiseAnswerInput, "dateKey">,
    now: Date,
  ): Promise<ResultApp<RiseAnswerResult, AppErr>> {
    try {
      const result = await this.repository.answer({ ...input, dateKey: RiseRules.toDateKey(now) });
      return ok(result);
    } catch (error) {
      return err(toAppErr(error, "No pudimos guardar tu respuesta"));
    }
  }
}
