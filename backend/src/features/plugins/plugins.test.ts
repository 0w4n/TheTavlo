import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test, { afterEach } from "node:test";
import { syncCatalog } from "./app/sync.service.js";
import { parsePluginManifest, parseRegistry } from "./domain/manifest.validator.js";
import { pluginsRouter } from "./plugins.router.js";

// ── Firestore en memoria (solo el subconjunto que usa la feature) ─────────────────────────────
type Data = Record<string, any>;
const coded = (code: number) => Object.assign(new Error("fs"), { code });
const field = (d: Data, path: string) => path.split(".").reduce<any>((v, k) => v?.[k], d);

class Snap {
  constructor(readonly ref: Ref, private readonly raw: Data | undefined) {}
  get id() { return this.ref.id; }
  get exists() { return this.raw !== undefined; }
  data() { return this.raw === undefined ? undefined : structuredClone(this.raw); }
}
class Query {
  constructor(protected db: FakeDb, readonly path: string, private f: Array<[string, string, any]> = [],
    private ord?: [string, string], private lim?: number, private cur?: Snap) {}
  where(a: string, op: string, v: any) { return new Query(this.db, this.path, [...this.f, [a, op, v]], this.ord, this.lim, this.cur); }
  orderBy(a: string, d = "asc") { return new Query(this.db, this.path, this.f, [a, d], this.lim, this.cur); }
  limit(n: number) { return new Query(this.db, this.path, this.f, this.ord, n, this.cur); }
  startAfter(s: Snap) { return new Query(this.db, this.path, this.f, this.ord, this.lim, s); }
  async get() {
    let docs = [...this.db.docs.keys()]
      .filter((k) => k.startsWith(this.path + "/") && !k.slice(this.path.length + 1).includes("/"))
      .map((k) => new Snap(new Ref(this.db, k), this.db.docs.get(k)));
    const ok = (d: Data, [a, op, v]: [string, string, any]) => {
      const x = field(d, a);
      return op === "==" ? x === v : op === "<" ? x < v : op === "<=" ? x <= v : op === ">" ? x > v : op === ">=" ? x >= v : Array.isArray(x) && x.includes(v);
    };
    docs = docs.filter((s) => this.f.every((c) => ok(s.data()!, c)));
    const [oa, od] = this.ord ?? [this.f[0]?.[0], "asc"];
    docs.sort((a, b) => {
      const x = oa ? field(a.data()!, oa) : a.id, y = oa ? field(b.data()!, oa) : b.id;
      return (x < y ? -1 : x > y ? 1 : a.id < b.id ? -1 : 1) * (od === "desc" ? -1 : 1);
    });
    if (this.cur) docs = docs.slice(docs.findIndex((s) => s.id === this.cur!.id) + 1);
    if (this.lim !== undefined) docs = docs.slice(0, this.lim);
    return { docs, size: docs.length };
  }
}
class Col extends Query {
  get id() { return this.path.split("/").pop()!; }
  get parent(): Ref | null { const p = this.path.split("/"); return p.length > 1 ? new Ref(this.db, p.slice(0, -1).join("/")) : null; }
  doc(id = `auto${++this.db.auto}`) { return new Ref(this.db, `${this.path}/${id}`); }
}
class Ref {
  constructor(private db: FakeDb, readonly path: string) {}
  get id() { return this.path.split("/").pop()!; }
  collection(id: string) { return new Col(this.db, `${this.path}/${id}`); }
  getSync() { return new Snap(this, this.db.docs.get(this.path)); }
  async get() { return this.getSync(); }
  apply(data: Data, o?: { merge?: boolean }) {
    this.db.docs.set(this.path, structuredClone(o?.merge ? { ...this.db.docs.get(this.path), ...data } : data));
  }
  async set(d: Data, o?: { merge?: boolean }) { this.apply(d, o); }
  async create(d: Data) { if (this.db.docs.has(this.path)) throw coded(6); this.apply(d); }
  async update(d: Data) { if (!this.db.docs.has(this.path)) throw coded(5); this.apply(d, { merge: true }); }
  async listCollections() {
    const names = new Set([...this.db.docs.keys()].filter((k) => k.startsWith(this.path + "/")).map((k) => k.slice(this.path.length + 1).split("/")[0]!));
    return [...names].map((n) => this.collection(n));
  }
}
class FakeDb {
  docs = new Map<string, Data>();
  auto = 0;
  collection(p: string) { return new Col(this, p); }
  doc(p: string) { return new Ref(this, p); }
  async getAll(...refs: Ref[]) { return refs.map((r) => r.getSync()); }
  async runTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    const writes: Array<() => void> = [];
    const tx = {
      get: async (x: Ref | Query) => (x instanceof Ref ? x.getSync() : x.get()),
      set: (r: Ref, d: Data, o?: any) => writes.push(() => r.apply(d, o)),
      create: (r: Ref, d: Data) => { if (this.docs.has(r.path)) throw coded(6); writes.push(() => r.apply(d)); },
      delete: (r: Ref) => writes.push(() => void this.docs.delete(r.path)),
    };
    const out = await fn(tx);
    writes.forEach((w) => w());
    return out;
  }
}

// ── Escenario ────────────────────────────────────────────────────────────────────────────────
const NS = "users/owner/panels/p1/widgets";
const manifest = (id: string, perms: string[]) => parsePluginManifest({
  manifestVersion: 1, hostApi: 1, id, name: id, version: "1.0.0", description: "", author: { name: "a" }, license: "MIT",
  permissions: perms, widgets: [{ key: "main", name: "Main", description: "" }],
});

function setup() {
  const db = new FakeDb();
  const release = (id: string, perms: string[], status = "approved") =>
    db.docs.set(`pluginReleases/${id}__1.0.0`, { pluginId: id, version: "1.0.0", status, manifest: manifest(id, perms), bundleUrls: [], integrity: "x" });
  const install = (id: string, granted: string[]) =>
    db.docs.set(`users/owner/installedPlugins/${id}`, { pluginId: id, version: "1.0.0", grantedPermissions: granted });
  release("acme.notes", ["db.read", "db.write"]); install("acme.notes", ["db.read", "db.write"]);
  release("other.thing", ["db.read", "db.write"]); install("other.thing", ["db.read"]); // sin db.write concedido
  db.docs.set(`${NS}/w1`, { type: "plugin:acme.notes/main" });
  db.docs.set(`${NS}/w2`, { type: "plugin:other.thing/main" });
  db.docs.set(`${NS}/wnative`, { type: "tasks" });
  db.docs.set("users/owner/panels/p2/widgets/wx", { type: "plugin:acme.notes/main" });
  db.docs.set("sharedPanelIndex/viewer/panels/p1", { role: "viewer", status: "accepted" });
  // Entrada sin normalizar a propósito: los parsers-función de tRPC tipan la ENTRADA como su salida.
  type Raw = Record<string, (input: unknown) => Promise<any>>;
  const as = (uid: string) => pluginsRouter.createCaller({ db, user: { uid, isAnonymous: false, email: null }, appCheckToken: null } as any).runtime.db as unknown as Raw;
  return { db, owner: as("owner"), viewer: as("viewer"), release, install };
}
const scope = (widgetId = "w1", panelId = "p1") => ({ ownerId: "owner", ownerAccountType: "users" as const, panelId, widgetId });
const rejects = (p: Promise<unknown>, code: string) =>
  assert.rejects(p, (e: any) => { assert.equal(e.code, code, `esperaba ${code}, fue ${e.code}: ${e.message}`); return true; });
const base = (path: string, extra: object = {}, widgetId = "w1") => ({ ...scope(widgetId), target: "instance" as const, path, ...extra });

// ── Casos de abuso del CRUD ──────────────────────────────────────────────────────────────────
test("path con '..', segmento __x__, profundidad 5 y paridad incorrecta → BAD_REQUEST", async () => {
  const { owner } = setup();
  for (const path of ["notes/../x", "notes/__x__", "a/b/c/d/e", "a/b/c/d/e/f", "notes", "notes/a/b", "/notes/a", "notes//a", "no tes/a"]) {
    await rejects(owner.get(base(path)), "BAD_REQUEST");
  }
  await rejects(owner.list(base("notes/a")), "BAD_REQUEST"); // doc donde se espera colección
});

test("documento de 40 KB → PAYLOAD_TOO_LARGE; el merge que supera 32 KB también", async () => {
  const { owner } = setup();
  await rejects(owner.set({ ...base("notes/a"), data: { t: "x".repeat(40 * 1024) } }), "PAYLOAD_TOO_LARGE");
  await owner.set({ ...base("notes/a"), data: { a: "x".repeat(20 * 1024) } });
  await rejects(owner.set({ ...base("notes/a"), data: { b: "y".repeat(20 * 1024) }, merge: true }), "PAYLOAD_TOO_LARGE");
  await rejects(owner.update({ ...base("notes/a"), data: { b: "y".repeat(20 * 1024) } }), "PAYLOAD_TOO_LARGE");
});

test("documento nº 1001 → TOO_MANY_REQUESTS (create y set sobre inexistente); borrar libera cupo", async () => {
  const { owner, db } = setup();
  const root = `${NS}/w1/pluginDb/root`;
  db.docs.set(root, { docCount: 999 });
  const { id } = await owner.create({ ...base("notes"), data: { n: 1000 } });
  assert.equal(db.docs.get(root)!.docCount, 1000);
  await rejects(owner.create({ ...base("notes"), data: { n: 1001 } }), "TOO_MANY_REQUESTS");
  await rejects(owner.set({ ...base("notes/nuevo"), data: { n: 1 } }), "TOO_MANY_REQUESTS");
  await owner.set({ ...base(`notes/${id}`), data: { n: 2 } }); // sobre existente: no consume cupo
  assert.deepEqual(await owner.delete(base(`notes/${id}`)), { deleted: true });
  assert.equal(db.docs.get(root)!.docCount, 999);
  assert.deepEqual(await owner.delete(base(`notes/${id}`)), { deleted: false }); // idempotente
  assert.equal(db.docs.get(root)!.docCount, 999);
});

test("viewer escribiendo → FORBIDDEN (en instance y panel); leer sí; no-miembro no lee", async () => {
  const { owner, viewer, db } = setup();
  await owner.set({ ...base("notes/a"), data: { v: 1 } });
  for (const target of ["instance", "panel"] as const) {
    await rejects(viewer.set({ ...base("notes/a"), target, data: { v: 2 } }), "FORBIDDEN");
    await rejects(viewer.create({ ...base("notes"), target, data: { v: 2 } }), "FORBIDDEN");
    await rejects(viewer.delete({ ...base("notes/a"), target }), "FORBIDDEN");
    await rejects(viewer.deleteCollection({ ...base("notes"), target }), "FORBIDDEN");
  }
  assert.deepEqual((await viewer.get(base("notes/a")))?.data, { v: 1 });
  db.docs.delete("sharedPanelIndex/viewer/panels/p1");
  await rejects(viewer.get(base("notes/a")), "FORBIDDEN");
});

test("plugin sin db.write (concedido) → FORBIDDEN; sin permiso en manifest tampoco; leer sí", async () => {
  const { owner, release } = setup();
  await rejects(owner.set({ ...base("notes/a", {}, "w2"), data: { v: 1 } }), "FORBIDDEN");
  assert.equal(await owner.get(base("notes/a", {}, "w2")), null);
  release("other.thing", ["db.read"]); // manifest sin db.write aunque el usuario lo hubiera concedido
  await rejects(owner.create({ ...base("notes", {}, "w2"), data: {} }), "FORBIDDEN");
});

test("kill-switch: release revoked o plugin desinstalado → FORBIDDEN", async () => {
  const { owner, db, release } = setup();
  release("acme.notes", ["db.read", "db.write"], "revoked");
  await rejects(owner.get(base("notes/a")), "FORBIDDEN");
  release("acme.notes", ["db.read", "db.write"]);
  db.docs.delete("users/owner/installedPlugins/acme.notes");
  await rejects(owner.get(base("notes/a")), "FORBIDDEN");
});

test("widgetId de otro panel / inexistente / no-plugin → NOT_FOUND", async () => {
  const { owner } = setup();
  await rejects(owner.get({ ...base("notes/a"), widgetId: "wx" }), "NOT_FOUND"); // wx existe, pero en p2
  await rejects(owner.get({ ...base("notes/a"), widgetId: "nope" }), "NOT_FOUND");
  await rejects(owner.get({ ...base("notes/a"), widgetId: "wnative" }), "NOT_FOUND");
});

test("pluginId no se acepta del cliente (claves desconocidas) → BAD_REQUEST", async () => {
  const { owner } = setup();
  await rejects(owner.get({ ...base("notes/a"), pluginId: "other.thing" }), "BAD_REQUEST");
  await rejects(owner.set({ ...base("notes/a"), data: {}, root: "x" }), "BAD_REQUEST");
});

test("target 'panel' desde otro plugin: queda aislado en SU namespace, no alcanza el del otro", async () => {
  const { owner, db } = setup();
  db.docs.set("users/owner/installedPlugins/other.thing", { pluginId: "other.thing", version: "1.0.0", grantedPermissions: ["db.read", "db.write"] });
  await owner.set({ ...base("notes/a"), target: "panel", data: { de: "acme" } });
  await owner.set({ ...base("notes/a", {}, "w2"), target: "panel", data: { de: "other" } });
  assert.ok(db.docs.has("users/owner/panels/p1/pluginDb/acme.notes/notes/a"));
  assert.ok(db.docs.has("users/owner/panels/p1/pluginDb/other.thing/notes/a"));
  assert.deepEqual((await owner.get({ ...base("notes/a"), target: "panel" }))?.data, { de: "acme" });
  assert.deepEqual((await owner.get({ ...base("notes/a", {}, "w2"), target: "panel" }))?.data, { de: "other" });
  // instance ≠ panel
  assert.equal(await owner.get(base("notes/a")), null);
});

test("datos: claves __, listas anidadas, profundidad 9, no-objeto → BAD_REQUEST; profundidad 8 OK", async () => {
  const { owner } = setup();
  const nest = (n: number): Record<string, unknown> => (n <= 1 ? { x: 1 } : { a: nest(n - 1) });
  await owner.set({ ...base("notes/ok"), data: nest(8) });
  await rejects(owner.set({ ...base("notes/d9"), data: nest(9) }), "BAD_REQUEST");
  await rejects(owner.set({ ...base("notes/k"), data: { __a: 1 } }), "BAD_REQUEST");
  await rejects(owner.set({ ...base("notes/k"), data: { "a/b": 1 } }), "BAD_REQUEST");
  await rejects(owner.set({ ...base("notes/k"), data: { l: [[1]] } }), "BAD_REQUEST");
  await rejects(owner.set({ ...base("notes/k"), data: [1] }), "BAD_REQUEST");
  await owner.set({ ...base("notes/ok2"), data: { l: [{ a: [1, 2] }], n: null, b: true } });
});

test("CRUD: create/get/update/set merge/list paginado/collections/deleteCollection (no recursivo)", async () => {
  const { owner, db } = setup();
  const { id, path } = await owner.create({ ...base("notes"), data: { t: "hola", p: 1, o: { a: 1 } } });
  assert.equal(path, `notes/${id}`);
  await rejects(owner.update({ ...base("notes/zzz"), data: { t: 1 } }), "NOT_FOUND");
  await owner.update({ ...base(path), data: { t: "adiós" } });
  await owner.set({ ...base(path), data: { o: { b: 2 } }, merge: true });
  assert.deepEqual((await owner.get(base(path)))?.data, { t: "adiós", p: 1, o: { a: 1, b: 2 } });
  assert.ok(!JSON.stringify(await owner.get(base(path))).includes("pluginDb")); // sin rutas internas

  for (let i = 1; i <= 5; i++) await owner.set({ ...base(`items/i${i}`), data: { n: i } });
  const p1 = await owner.list({ ...base("items"), limit: 2 });
  assert.deepEqual(p1.docs.map((d: { id: string }) => d.id), ["i1", "i2"]);
  const p2 = await owner.list({ ...base("items"), limit: 2, startAfter: p1.nextCursor! });
  assert.deepEqual(p2.docs.map((d: { id: string }) => d.id), ["i3", "i4"]);
  const p3 = await owner.list({ ...base("items"), limit: 2, startAfter: p2.nextCursor! });
  assert.deepEqual([p3.docs.map((d: { id: string }) => d.id), p3.nextCursor], [["i5"], null]);
  const f = await owner.list({ ...base("items"), where: { field: "n", op: ">=", value: 4 }, orderBy: { field: "n", direction: "desc" } });
  assert.deepEqual(f.docs.map((d: { id: string }) => d.id), ["i5", "i4"]);

  await rejects(owner.list({ ...base("items"), limit: 101 }), "BAD_REQUEST");
  await rejects(owner.list({ ...base("items"), where: { field: "n", op: "==", value: 1 }, orderBy: { field: "n" } }), "BAD_REQUEST");
  await rejects(owner.list({ ...base("items"), where: { field: "n", op: ">", value: 1 }, orderBy: { field: "otro" } }), "BAD_REQUEST");
  await rejects(owner.list({ ...base("items"), where: { field: "n", op: "!=", value: 1 } }), "BAD_REQUEST");
  await rejects(owner.list({ ...base("items"), startAfter: "no-existe" }), "BAD_REQUEST");

  assert.deepEqual((await owner.collections({ ...scope(), target: "instance" })).collections, ["items", "notes"]);
  assert.deepEqual((await owner.collections({ ...scope(), target: "instance", path: "items/i1" })).collections, []);

  // Subcolección bajo un doc: no la borra deleteCollection del padre (no recursivo)
  await owner.set({ ...base("items/i1/sub/s1"), data: { s: 1 } });
  assert.deepEqual(await owner.deleteCollection(base("items")), { deleted: 5, hasMore: false });
  assert.ok(db.docs.has(`${NS}/w1/pluginDb/root/items/i1/sub/s1`));
});

test("deleteCollection: lotes de 499, hasMore y contador exacto", async () => {
  const { owner, db } = setup();
  const root = `${NS}/w1/pluginDb/root`;
  for (let i = 0; i < 600; i++) db.docs.set(`${root}/big/d${i}`, { i });
  db.docs.set(root, { docCount: 600 });
  assert.deepEqual(await owner.deleteCollection(base("big")), { deleted: 499, hasMore: true });
  assert.equal(db.docs.get(root)!.docCount, 101);
  assert.deepEqual(await owner.deleteCollection(base("big")), { deleted: 101, hasMore: false });
  assert.equal(db.docs.get(root)!.docCount, 0);
});

// ── Validadores / manifiesto ─────────────────────────────────────────────────────────────────
test("manifest: valores por defecto, .strict y límites", () => {
  const m = manifest("acme.notes", []);
  assert.deepEqual([m.widgets[0]!.icon, m.widgets[0]!.category, m.widgets[0]!.resizable, m.widgets[0]!.singleton], ["IconPuzzle", "other", true, false]);
  assert.deepEqual(m.widgets[0]!.defaultLayout, { lg: { x: 0, y: 0, w: 3, h: 2 } });
  const raw = (over: object) => ({ manifestVersion: 1, hostApi: 1, id: "acme.notes", name: "n", version: "1.0.0", description: "", author: { name: "a" }, license: "MIT", permissions: [], widgets: [{ key: "main", name: "M", description: "" }], ...over });
  assert.throws(() => parsePluginManifest(raw({ extra: 1 })), /no permitidas/);
  assert.throws(() => parsePluginManifest(raw({ id: "Acme" })));
  assert.throws(() => parsePluginManifest(raw({ version: "1.0" })));
  assert.throws(() => parsePluginManifest(raw({ permissions: ["db.admin"] })));
  assert.throws(() => parsePluginManifest(raw({ author: { name: "a", url: "javascript:alert(1)" } })));
  assert.throws(() => parsePluginManifest(raw({ widgets: [] })));
  const w = { key: "a", name: "A", description: "" };
  assert.throws(() => parsePluginManifest(raw({ widgets: [w, w] })), /duplicado/);
  assert.throws(() => parsePluginManifest(raw({ widgets: [{ ...w, defaultConfig: { big: "x".repeat(5000) } }] })), /grande/);
  assert.throws(() => parsePluginManifest(raw({ widgets: [{ ...w, defaultConfig: { __a__: 1 } }] })));
  assert.throws(() => parsePluginManifest(raw({ widgets: Array.from({ length: 9 }, (_, i) => ({ ...w, key: `k${i}` })) })));
  assert.deepEqual(parsePluginManifest(raw({ permissions: ["db.read", "db.write"] })).permissions, ["db.read", "db.write"]);
  assert.throws(() => parseRegistry([{ id: "acme.notes", repo: "a/b", tier: "x" }]));
  assert.throws(() => parseRegistry([{ id: "acme.notes", repo: "a/b", tier: "verified", z: 1 }]));
});

// ── Sync: GitHub simulado ────────────────────────────────────────────────────────────────────
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

const SHA = "a".repeat(40);
const HTML = Buffer.from("<!doctype html><html><body>hola ñ</body></html>", "utf8");

function mockGithub(files: Record<string, Buffer | number>, tags = [{ name: "v1.0.0", commit: { sha: SHA } }]) {
  globalThis.fetch = (async (url: string) => {
    const u = new URL(url);
    if (u.pathname.endsWith("/tags")) return Response.json(tags);
    const file = decodeURIComponent(u.pathname).replace(/^\/repos\/[^/]+\/[^/]+\/contents\//, "");
    const hit = files[file];
    if (hit === undefined) return new Response("nf", { status: 404 });
    if (typeof hit === "number") return new Response("err", { status: hit });
    return new Response(new Uint8Array(hit), { status: 200 });
  }) as typeof fetch;
}
const registry = Buffer.from(JSON.stringify([{ id: "acme.notes", repo: "acme/notes", tier: "community" }]));
const manifestBytes = (version = "1.0.0") => Buffer.from(JSON.stringify({
  manifestVersion: 1, hostApi: 1, id: "acme.notes", name: "Notes", version, description: "", author: { name: "a" }, license: "MIT",
  permissions: ["db.read"], widgets: [{ key: "main", name: "M", description: "" }],
}));

test("sync: release approved con integrity sha256 sobre BYTES y bundleUrls en orden", async () => {
  mockGithub({ "registry.json": registry, "thetavlo.plugin.json": manifestBytes(), "dist/index.html": HTML });
  const db = new FakeDb();
  const report = await syncCatalog(db as any);
  assert.deepEqual(report, { plugins: 1, approved: 1, rejected: 0, revoked: 0, errors: 0 });
  const rel = db.docs.get("pluginReleases/acme.notes__1.0.0")!;
  assert.equal(rel.status, "approved");
  assert.equal(rel.integrity, `sha256-${createHash("sha256").update(HTML).digest("base64")}`);
  assert.equal(rel.sizeBytes, HTML.byteLength);
  assert.equal(rel.commitSha, SHA);
  assert.deepEqual(rel.bundleUrls, [
    `https://raw.githubusercontent.com/acme/notes/${SHA}/dist/index.html`,
    `https://cdn.jsdelivr.net/gh/acme/notes@${SHA}/dist/index.html`,
  ]);
  assert.equal(db.docs.get("pluginCatalog/acme.notes")!.latestVersion, "1.0.0");
  assert.equal(JSON.stringify(rel).includes("bundleUrl\""), false);
});

test("sync: rechaza sin dist, >1 MiB, no UTF-8, no HTML, vacío y manifiesto inválido; 5xx NO crea release", async () => {
  const cases: Array<[string, Record<string, Buffer | number>, string]> = [
    ["sin dist", {}, "no existe"],
    ["1 MiB+", { "dist/index.html": Buffer.alloc(1024 * 1024 + 1, 0x61) }, "1 MiB"],
    ["no utf8", { "dist/index.html": Buffer.from([0x3c, 0x68, 0xff, 0xfe]) }, "UTF-8"],
    ["no html", { "dist/index.html": Buffer.from("console.log(1)") }, "HTML"],
    ["vacío", { "dist/index.html": Buffer.alloc(0) }, "vacío"],
  ];
  for (const [name, dist, reason] of cases) {
    mockGithub({ "registry.json": registry, "thetavlo.plugin.json": manifestBytes(), ...dist });
    const db = new FakeDb();
    const r = await syncCatalog(db as any);
    assert.equal(r.rejected, 1, name);
    assert.match(db.docs.get("pluginReleases/acme.notes__1.0.0")!.reason, new RegExp(reason), name);
    assert.equal(db.docs.get("pluginReleases/acme.notes__1.0.0")!.bundleUrls, undefined);
  }
  mockGithub({ "registry.json": registry, "thetavlo.plugin.json": Buffer.from("{no json"), "dist/index.html": HTML });
  let db = new FakeDb();
  assert.equal((await syncCatalog(db as any)).rejected, 1);
  mockGithub({ "registry.json": registry, "thetavlo.plugin.json": manifestBytes("9.9.9"), "dist/index.html": HTML });
  db = new FakeDb();
  await syncCatalog(db as any);
  assert.match(db.docs.get("pluginReleases/acme.notes__1.0.0")!.reason, /version/);

  mockGithub({ "registry.json": registry, "thetavlo.plugin.json": manifestBytes(), "dist/index.html": 503 });
  db = new FakeDb();
  const r = await syncCatalog(db as any);
  assert.deepEqual([r.errors, r.rejected, db.docs.has("pluginReleases/acme.notes__1.0.0")], [1, 0, false]); // transitorio: reintenta
});

test("sync: tag movido → revoked; releases inmutables; sin estado 'building'", async () => {
  mockGithub({ "registry.json": registry, "thetavlo.plugin.json": manifestBytes(), "dist/index.html": HTML });
  const db = new FakeDb();
  await syncCatalog(db as any);
  mockGithub({ "registry.json": registry, "thetavlo.plugin.json": manifestBytes(), "dist/index.html": Buffer.from("<html>otro</html>") },
    [{ name: "v1.0.0", commit: { sha: "b".repeat(40) } }]);
  const r = await syncCatalog(db as any);
  assert.equal(r.revoked, 1);
  const rel = db.docs.get("pluginReleases/acme.notes__1.0.0")!;
  assert.deepEqual([rel.status, rel.commitSha], ["revoked", SHA]);
  assert.equal((await syncCatalog(db as any)).revoked, 0);
});
