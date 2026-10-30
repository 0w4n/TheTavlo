import { createContext } from "react";
import type { PanelScope, ResolvedPlugin } from "../../domain/plugin.types";

export interface PluginRuntimeValue {
  plugins: ReadonlyMap<string, ResolvedPlugin>;
  scope: PanelScope;
  readOnly: boolean;
  onToast?: (message: string) => void;
  /** Vuelve a resolver plugins (tras instalar/desinstalar). */
  refresh: () => Promise<void>;
}

export const PluginRuntimeContext = createContext<PluginRuntimeValue | null>(null);
