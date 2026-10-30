import type { PluginManifest, PluginPermission } from "./manifest.schema.js";

export type PluginTier = "verified" | "community";
export type ReleaseStatus = "pending" | "building" | "approved" | "rejected" | "revoked";
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
  bundleUrl?: string;
  integrity?: string; // sha256-<base64> del index.html publicado
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
  bundleUrl: string;
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
