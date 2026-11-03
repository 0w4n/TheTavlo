import type { PluginManifest, PluginPermission, PluginTier } from "./manifest.validator.js";

export type { PluginTier };
/** `pending` no lo produce el sync: queda reservado para moderación manual. */
export type ReleaseStatus = "pending" | "approved" | "rejected" | "revoked";
export type AccountType = "users" | "guests";

/** pluginCatalog/{pluginId} — qué plugins existen (curado por registry). */
export interface PluginCatalogEntry {
  id: string;
  repo: string; // owner/name
  tier: PluginTier;
  listed: boolean;
  latestVersion: string | null;
  updatedAt: string;
}

/** pluginReleases/{pluginId}__{version} — INMUTABLE una vez creada (salvo status). */
export interface PluginRelease {
  pluginId: string;
  version: string;
  commitSha: string; // pin al SHA, nunca al tag
  status: ReleaseStatus;
  manifest: PluginManifest | null;
  reason?: string;
  /** Orígenes de descarga en orden de preferencia (raw.githubusercontent.com, jsDelivr). */
  bundleUrls?: string[];
  integrity?: string; // sha256-<base64> de los BYTES de dist/index.html
  sizeBytes?: number;
  createdAt: string;
  updatedAt: string;
}

/** {accountType}/{ownerId}/installedPlugins/{pluginId} */
export interface InstalledPlugin {
  pluginId: string;
  version: string; // versión fijada (pinned)
  grantedPermissions: PluginPermission[];
  installedAt: string;
}

/** Lo que consume el runtime del cliente. */
export interface ResolvedPlugin {
  pluginId: string;
  version: string;
  manifest: PluginManifest;
  bundleUrls: string[];
  integrity: string;
  /** Intersección manifest.permissions ∩ concedidos: el manifest no puede escalar. */
  permissions: PluginPermission[];
}

export interface MarketplaceListing {
  id: string;
  name: string;
  description: string;
  author: string;
  tier: PluginTier;
  version: string;
  permissions: PluginPermission[];
  widgetCount: number;
  installedVersion: string | null;
}
