import { trpcMutation, trpcQuery } from "#core/appCore/infrastructure/api/trpcClient";
import type { PanelScope, ResolvedPlugin } from "../domain/plugin.types";

export const fetchPanelPlugins = (scope: PanelScope) =>{
  console.log("panelScope: ", scope);
  return trpcQuery<ResolvedPlugin[]>("plugins.runtime.forPanel", scope);
};

export const getInstanceState = (scope: PanelScope, widgetId: string) =>
  trpcQuery<Record<string, unknown>>("plugins.runtime.getState", { ...scope, widgetId });

export const patchInstanceState = (scope: PanelScope, widgetId: string, patch: Record<string, unknown>) =>
  trpcMutation<Record<string, unknown>>("plugins.runtime.patchState", { ...scope, widgetId, patch });
