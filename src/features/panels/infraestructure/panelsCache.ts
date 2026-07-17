import type { Panel } from "../domain/panel.entity";
import type { AppErr, ResultApp } from "#core/appCore/domain/AppCore.type";
import { isErr, ok } from "#core/appCore/domain/AppCore.type";

/**
 * Caché parcial progresiva en memoria para paneles.
 *
 * Objetivo: que navegar entre paneles ya visitados en la sesión actual no
 * genere lecturas nuevas a Firestore. Vive a nivel de MÓDULO (no atada a
 * ninguna instancia de repositorio) a propósito — tanto `panel.loader.ts`
 * (se ejecuta en cada navegación) como los providers en `App.tsx` crean
 * instancias nuevas del repositorio de Firebase; si la caché viviera dentro
 * de esas instancias, se perdería todo el tiempo y no serviría de nada.
 *
 * Todo queda namespaced por `cacheKey` (ver `getPanelsCacheKey`) para que
 * dos usuarios distintos — o un guest que hace login — nunca compartan
 * datos entre sí.
 */

const ROOT = "__root__";

interface CacheBucket {
  /** panelId -> Panel. El corazón de la caché. */
  panels: Map<string, Panel>;
  /** parentKey -> ids de hijos directos ya conocidos (loadedChildrenRegistry). */
  children: Map<string, Set<string>>;
  /**
   * parentKey para los que ya se ejecutó la query completa de hijos alguna
   * vez en esta sesión — incluso si el resultado fue una lista vacía. Sin
   * este set no habría forma de distinguir "todavía no until pedimos los
   * hijos" de "ya los pedimos y no tiene ninguno".
   */
  loadedParents: Set<string>;
}

const buckets = new Map<string, CacheBucket>();

function getBucket(cacheKey: string): CacheBucket {
  let bucket = buckets.get(cacheKey);
  if (!bucket) {
    bucket = { panels: new Map(), children: new Map(), loadedParents: new Set() };
    buckets.set(cacheKey, bucket);
  }
  return bucket;
}

function parentKeyOf(parentId: string | null): string {
  return parentId ?? ROOT;
}

/**
 * Clave de caché estable para un usuario. La ruta real en Firestore es
 * `{accountType}/{userId}/panels/{panelId}` — usamos el mismo par como
 * namespace acá para que el mapeo sea obvio.
 */
export function getPanelsCacheKey(user: {
  accountType: string;
  id: string;
}): string {
  return `${user.accountType}/${user.id}`;
}

// ─── Paneles individuales ──────────────────────────────────────────────────

export function getCachedPanel(cacheKey: string, id: string): Panel | undefined {
  return getBucket(cacheKey).panels.get(id);
}

export function setCachedPanel(cacheKey: string, panel: Panel): void {
  getBucket(cacheKey).panels.set(panel.id, panel);
}

export function setCachedPanels(cacheKey: string, panels: Panel[]): void {
  const bucket = getBucket(cacheKey);
  for (const panel of panels) bucket.panels.set(panel.id, panel);
}

export function deleteCachedPanel(cacheKey: string, id: string): void {
  getBucket(cacheKey).panels.delete(id);
}

export function deleteCachedPanels(cacheKey: string, ids: string[]): void {
  const bucket = getBucket(cacheKey);
  for (const id of ids) bucket.panels.delete(id);
}

// ─── Registro de hijos ya cargados (loadedChildrenRegistry) ────────────────

/** `undefined` = todavía no se pidió nunca; `Panel[]` (posiblemente vacío) = ya está en caché. */
export function getCachedChildren(
  cacheKey: string,
  parentId: string | null,
): Panel[] | undefined {
  const bucket = getBucket(cacheKey);
  const key = parentKeyOf(parentId);
  if (!bucket.loadedParents.has(key)) return undefined;

  const ids = bucket.children.get(key);
  if (!ids) return [];
  return Array.from(ids)
    .map((id) => bucket.panels.get(id))
    .filter((p): p is Panel => p !== undefined);
}

export function setCachedChildren(
  cacheKey: string,
  parentId: string | null,
  panels: Panel[],
): void {
  const bucket = getBucket(cacheKey);
  const key = parentKeyOf(parentId);
  setCachedPanels(cacheKey, panels);
  bucket.children.set(key, new Set(panels.map((p) => p.id)));
  bucket.loadedParents.add(key);
}

/**
 * Invalida el registro de hijos de un padre — la próxima vez que se pidan,
 * se vuelve a consultar Firestore. Se usa después de crear/mover/borrar un
 * panel para forzar el redibujado correcto de la UI (ver `cascadeDeletePanel`
 * y `CachedPanelsRepository`).
 */
export function invalidateChildren(cacheKey: string, parentId: string | null): void {
  const bucket = getBucket(cacheKey);
  const key = parentKeyOf(parentId);
  bucket.children.delete(key);
  bucket.loadedParents.delete(key);
}

/** Limpia toda la caché de un usuario — usar en logout / cambio de cuenta. */
export function clearPanelsCache(cacheKey: string): void {
  buckets.delete(cacheKey);
}

// ─── Helpers de alto nivel ──────────────────────────────────────────────────

/**
 * Garantiza que todos los `ids` pedidos estén en caché, pidiéndole a la
 * fuente (Firestore, normalmente) ÚNICAMENTE los que falten. Devuelve los
 * paneles en el mismo orden que `ids` (ids inexistentes se omiten del
 * resultado, no rompen la llamada).
 *
 * Es la pieza central de la reducción de lecturas: en una cadena
 * `home/:pid/:pid/:pid` ya visitada, esto resuelve en 0 llamadas a
 * `fetchMissing`.
 */
export async function ensurePanelsInCache(
  cacheKey: string,
  ids: string[],
  fetchMissing: (missingIds: string[]) => Promise<ResultApp<Panel[], AppErr>>,
): Promise<ResultApp<Panel[], AppErr>> {
  const uniqueIds = Array.from(new Set(ids));
  const missing = uniqueIds.filter((id) => getCachedPanel(cacheKey, id) === undefined);

  if (missing.length > 0) {
    const fetched = await fetchMissing(missing);
    if (isErr(fetched)) return fetched;
    setCachedPanels(cacheKey, fetched.value);
  }

  const panels = ids
    .map((id) => getCachedPanel(cacheKey, id))
    .filter((p): p is Panel => p !== undefined);

  return ok(panels);
}

/**
 * Lista los hijos directos de `parentId` bajo demanda. Si ya se pidieron
 * antes en esta sesión, devuelve la caché sin tocar la fuente. Si no,
 * ejecuta `fetchFromSource` una única vez y registra el resultado (incluso
 * si viene vacío) para no repetir la query nunca más para ese padre —hasta
 * que algo la invalide explícitamente (`invalidateChildren`).
 */
export async function fetchChildrenPanels(
  cacheKey: string,
  parentId: string | null,
  fetchFromSource: () => Promise<ResultApp<Panel[], AppErr>>,
): Promise<ResultApp<Panel[], AppErr>> {
  const cached = getCachedChildren(cacheKey, parentId);
  if (cached !== undefined) return ok(cached);

  const result = await fetchFromSource();
  if (isErr(result)) return result;

  setCachedChildren(cacheKey, parentId, result.value);
  return ok(result.value);
}

/** Solo para tests: resetea todo el estado del módulo entre specs. */
export function __resetAllPanelsCacheForTests(): void {
  buckets.clear();
}
