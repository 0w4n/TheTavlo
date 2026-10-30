import { trpcMutation, trpcQuery } from "#core/appCore/infrastructure/api/trpcClient";
import type { PluginPermission } from "../../domain/plugin.types";
import type { MarketplaceListing } from "../domain/marketplace.types";

export const marketplaceApi = {
  list: (query?: string) => trpcQuery<MarketplaceListing[]>("plugins.marketplace.list", { query }),
  install: (pluginId: string, grantedPermissions: PluginPermission[], version?: string) =>
    trpcMutation<{ pluginId: string; version: string }>("plugins.marketplace.install", { pluginId, version, grantedPermissions }),
  uninstall: (pluginId: string) => trpcMutation<{ pluginId: string }>("plugins.marketplace.uninstall", { pluginId }),
};
