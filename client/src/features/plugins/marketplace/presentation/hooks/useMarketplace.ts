import { useCallback, useEffect, useState } from "react";
import type { PluginPermission } from "../../../domain/plugin.types";
import { usePluginRuntime } from "../../../presentation/hooks/usePluginRuntime";
import type { MarketplaceListing } from "../../domain/marketplace.types";
import { marketplaceApi } from "../../infrastructure/marketplaceApi.trpc";

type State = { status: "loading" | "ready" | "error"; items: MarketplaceListing[] };

export function useMarketplace() {
  const { refresh: refreshRuntime } = usePluginRuntime();
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [state, setState] = useState<State>({ status: "loading", items: [] });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: "loading" }));
    const timer = window.setTimeout(() => {
      marketplaceApi.list(query.trim() || undefined)
        .then((items) => { if (!cancelled) setState({ status: "ready", items }); })
        .catch(() => { if (!cancelled) setState((s) => ({ ...s, status: "error" })); });
    }, query ? 250 : 0); // debounce solo al teclear
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [query, tick]);

  const run = useCallback(async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      setTick((t) => t + 1);
      await refreshRuntime(); // registra/retira los widgets del plugin en el registry
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo completar la acción.");
    } finally {
      setBusyId(null);
    }
  }, [refreshRuntime]);

  return {
    ...state, query, setQuery, busyId, actionError,
    install: (id: string, perms: PluginPermission[]) => run(id, () => marketplaceApi.install(id, perms)),
    uninstall: (id: string) => run(id, () => marketplaceApi.uninstall(id)),
  };
}
