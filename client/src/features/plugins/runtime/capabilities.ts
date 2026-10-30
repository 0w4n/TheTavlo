import type { HostMethod } from "../domain/hostProtocol";
import type { PanelScope } from "../domain/plugin.types";
import { getInstanceState, patchInstanceState } from "../infrastructure/pluginsRuntime.trpc";

export interface CapabilityContext {
  scope: PanelScope;
  instanceId: string;
  onToast?: (message: string) => void;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

/**
 * Capacidades que el host expone. Cada una está atada al `instanceId` de SU
 * instancia: un plugin no puede direccionar el estado de otra instancia aunque
 * quiera, porque el id nunca viene en los parámetros que él controla.
 */
export function createCapabilities(get: () => CapabilityContext): Record<HostMethod, (p: unknown) => Promise<unknown>> {
  return {
    "storage.get": () => getInstanceState(get().scope, get().instanceId),
    "storage.patch": async (params) => {
      if (!isPlainObject(params)) throw new Error("bad_params");
      return patchInstanceState(get().scope, get().instanceId, params);
    },
    "toast.show": async (params) => {
      const message = isPlainObject(params) && typeof params.message === "string" ? params.message.slice(0, 200) : "";
      if (message) get().onToast?.(message); // siempre texto plano, nunca HTML
      return null;
    },
  };
}
