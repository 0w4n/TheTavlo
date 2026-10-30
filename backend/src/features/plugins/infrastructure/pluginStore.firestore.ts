import type { Firestore } from "firebase-admin/firestore";
import type {
  AccountType, InstalledPlugin, PluginCatalogEntry, PluginRelease,
} from "../domain/plugin.types.js";

const releaseKey = (id: string, version: string) => `${id}__${version}`;
const now = () => new Date().toISOString();

export class PluginStore {
  constructor(private readonly db: Firestore) {}

  private catalog() { return this.db.collection("pluginCatalog"); }
  private releases() { return this.db.collection("pluginReleases"); }
  private installs(type: AccountType, ownerId: string) {
    return this.db.collection(`${type}/${ownerId}/installedPlugins`);
  }

  // ── catálogo ────────────────────────────────────────────────────────────
  async upsertCatalog(e: Pick<PluginCatalogEntry, "id" | "repo" | "tier">) {
    await this.catalog().doc(e.id).set({ ...e, listed: true, updatedAt: now() }, { merge: true });
  }
  async unlistExcept(ids: Set<string>) {
    const all = await this.catalog().get();
    await Promise.all(all.docs.filter((d) => !ids.has(d.id)).map((d) => d.ref.update({ listed: false })));
  }
  async getCatalog(id: string) {
    const s = await this.catalog().doc(id).get();
    return s.exists ? (s.data() as PluginCatalogEntry) : null;
  }
  async listListed() {
    const s = await this.catalog().where("listed", "==", true).get();
    return s.docs.map((d) => d.data() as PluginCatalogEntry).filter((c) => c.latestVersion);
  }
  async setLatest(id: string, version: string) {
    await this.catalog().doc(id).update({ latestVersion: version, updatedAt: now() });
  }

  // ── releases ────────────────────────────────────────────────────────────
  async getRelease(id: string, version: string) {
    const s = await this.releases().doc(releaseKey(id, version)).get();
    return s.exists ? (s.data() as PluginRelease) : null;
  }
  /** `create()` falla si ya existe → una versión publicada no se puede reescribir. */
  async createRelease(r: Omit<PluginRelease, "createdAt" | "updatedAt">) {
    const t = now();
    await this.releases().doc(releaseKey(r.pluginId, r.version)).create({ ...r, createdAt: t, updatedAt: t });
  }
  async patchRelease(id: string, version: string, patch: Partial<PluginRelease>) {
    await this.releases().doc(releaseKey(id, version)).update({ ...patch, updatedAt: now() });
  }
  async listReleases(id: string) {
    const s = await this.releases().where("pluginId", "==", id).get();
    return s.docs.map((d) => d.data() as PluginRelease);
  }
  /** Alineado con la entrada; `null` si no existe. */
  async getReleases(pairs: Array<{ id: string; version: string }>): Promise<Array<PluginRelease | null>> {
    if (pairs.length === 0) return [];
    const refs = pairs.map((p) => this.releases().doc(releaseKey(p.id, p.version)));
    const snaps = await this.db.getAll(...refs);
    return snaps.map((s) => (s.exists ? (s.data() as PluginRelease) : null));
  }

  // ── instalaciones ───────────────────────────────────────────────────────
  async setInstall(type: AccountType, ownerId: string, i: Omit<InstalledPlugin, "installedAt">) {
    await this.installs(type, ownerId).doc(i.pluginId).set({ ...i, installedAt: now() });
  }
  async removeInstall(type: AccountType, ownerId: string, pluginId: string) {
    await this.installs(type, ownerId).doc(pluginId).delete();
  }
  async listInstalled(type: AccountType, ownerId: string) {
    const s = await this.installs(type, ownerId).get();
    return s.docs.map((d) => d.data() as InstalledPlugin);
  }
}
