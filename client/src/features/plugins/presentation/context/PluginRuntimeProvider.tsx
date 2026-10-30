import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PanelScope, ResolvedPlugin } from "../../domain/plugin.types";
import { fetchPanelPlugins } from "../../infrastructure/pluginsRuntime.trpc";
import { syncWidgetRegistry } from "../../runtime/syncWidgetRegistry";
import { PluginRuntimeContext } from "./pluginRuntime.context";

interface Props {
  scope: PanelScope; // { ownerId, ownerAccountType, panelId } — igual que los repos trpc existentes
  readOnly?: boolean; // true si el usuario es "viewer" del panel compartido
  onToast?: (message: string) => void;
  children: ReactNode;
}

export function PluginRuntimeProvider({ scope, readOnly = false, onToast, children }: Props) {
  const [plugins, setPlugins] = useState<ReadonlyMap<string, ResolvedPlugin>>(() => new Map());
  const [ready, setReady] = useState(false);
  const scopeKey = `${scope.ownerAccountType}/${scope.ownerId}/${scope.panelId}`;

  const refresh = useCallback(async () => {
    try {
      const list = await fetchPanelPlugins(scope);
      syncWidgetRegistry(list);
      setPlugins(new Map(list.map((p) => [p.pluginId, p])));
    } catch (error) {
      console.error("[plugins] no se pudieron resolver los plugins del panel", error);
    } finally {
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey]);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo(
    () => ({ plugins, scope, readOnly, onToast, refresh }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plugins, scopeKey, readOnly, onToast, refresh],
  );

  // Evita el parpadeo de <UnknownWidget> para tipos `plugin:*` aún no registrados.
  if (!ready) return null;
  return <PluginRuntimeContext.Provider value={value}>{children}</PluginRuntimeContext.Provider>;
}
