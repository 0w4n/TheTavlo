import type { DocumentReference, Unsubscribe } from "firebase/firestore";
import type { PanelRepository } from "../app/panelsRepository.interface";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import type { AppErr, ResultApp } from "#core/appCore/domain/AppCore.type";
import { isOk } from "#core/appCore/domain/AppCore.type";
import {
  deleteCachedPanel,
  deleteCachedPanels,
  ensurePanelsInCache,
  fetchChildrenPanels,
  getCachedPanel,
  invalidateChildren,
  setCachedPanel,
  setCachedPanels,
} from "./panelsCache";

/**
 * Decorador de caché sobre cualquier `PanelRepository`. No sabe nada de
 * Firestore en particular — solo intercepta lecturas para servirlas desde
 * memoria cuando es posible, y mantiene la caché sincronizada en cada
 * escritura exitosa. Se puede envolver cualquier implementación (Firebase,
 * un fake de test, etc.) sin tocar una línea de este archivo.
 *
 * `cacheKey` identifica al usuario dueño de los paneles — ver
 * `getPanelsCacheKey`. Debe ser estable mientras dure la sesión y distinto
 * entre usuarios, para que la caché nunca filtre datos entre cuentas.
 */
export class CachedPanelsRepository implements PanelRepository {
  constructor(
    private readonly inner: PanelRepository,
    private readonly cacheKey: string,
  ) {}

  // ─── Suscripciones — pasan siempre por la fuente real, pero alimentan la
  // caché "gratis" con cada dato que llega por el listener ─────────────────

  subscribeToHomePanel(
    onData: (panel: Panel) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.inner.subscribeToHomePanel((panel) => {
      setCachedPanel(this.cacheKey, panel);
      onData(panel);
    }, onError);
  }

  subscribeToAll(
    onData: (panels: Panel[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.inner.subscribeToAll((panels) => {
      setCachedPanels(this.cacheKey, panels);
      onData(panels);
    }, onError);
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async findAll(): Promise<ResultApp<Panel[], AppErr>> {
    const result = await this.inner.findAll();
    if (isOk(result)) setCachedPanels(this.cacheKey, result.value);
    return result;
  }

  async findHomePanel(): Promise<ResultApp<Panel, AppErr>> {
    const result = await this.inner.findHomePanel();
    if (isOk(result)) setCachedPanel(this.cacheKey, result.value);
    return result;
  }

  async findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>> {
    const cached = getCachedPanel(this.cacheKey, id);
    if (cached) return { success: true, value: cached };

    const result = await this.inner.findById(id);
    if (isOk(result) && result.value) setCachedPanel(this.cacheKey, result.value);
    return result;
  }

  /**
   * Punto de entrada usado por `PanelsService.resolveChain` para validar la
   * cadena completa de la URL en una sola pasada: pide a la caché primero
   * (`ensurePanelsInCache`) y solo baja a Firestore los ids que falten.
   */
  async findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>> {
    return ensurePanelsInCache(this.cacheKey, ids, (missing) =>
      this.inner.findManyByIds(missing),
    );
  }

  async findByRef(
    ref: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    const cached = getCachedPanel(this.cacheKey, ref.id);
    if (cached) return { success: true, value: cached };

    const result = await this.inner.findByRef(ref);
    if (isOk(result) && result.value) setCachedPanel(this.cacheKey, result.value);
    return result;
  }

  async findBySharedId(
    sharedId: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    // Cruza límites de usuario (paneles compartidos por otra persona dueña
    // de un bucket de caché distinto) — se deja pasar sin cachear acá para
    // no mezclar datos entre cuentas.
    return this.inner.findBySharedId(sharedId);
  }

  /**
   * Lista los hijos directos bajo demanda: si el padre ya fue consultado en
   * esta sesión (`loadedChildrenRegistry`), no vuelve a pegarle a Firestore.
   */
  async findByParentId(
    parentId: DocumentReference,
  ): Promise<ResultApp<Panel[], AppErr>> {
    return fetchChildrenPanels(this.cacheKey, parentId.id, () =>
      this.inner.findByParentId(parentId),
    );
  }

  async findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>> {
    // Solo arma una referencia local — no es una lectura, nada que cachear.
    return this.inner.findDocRef(id);
  }

  // ─── Mutaciones — actualizan Firestore (vía `inner`) y la caché local al
  // mismo tiempo, para que la UI nunca quede mostrando datos viejos ────────

  async create(
    data: CreatePanelDTO,
    parentId?: DocumentReference,
  ): Promise<ResultApp<Panel, AppErr>> {
    const result = await this.inner.create(data, parentId);
    if (isOk(result)) {
      setCachedPanel(this.cacheKey, result.value);
      invalidateChildren(this.cacheKey, parentId?.id ?? null);
    }
    return result;
  }

  async addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>> {
    const result = await this.inner.addSubPanel(parentRef, childRef);
    if (isOk(result)) invalidateChildren(this.cacheKey, parentRef.id);
    return result;
  }

  async update(
    id: string,
    data: UpdatePanelDTO,
  ): Promise<ResultApp<Panel, AppErr>> {
    const previous = getCachedPanel(this.cacheKey, id);
    const result = await this.inner.update(id, data);

    if (isOk(result)) {
      setCachedPanel(this.cacheKey, result.value);

      // Si el panel cambió de padre, el registro de hijos de AMBOS padres
      // (el viejo y el nuevo) queda desactualizado — invalidamos los dos.
      const previousParentId = previous?.parentId?.id ?? null;
      const nextParentId = result.value.parentId?.id ?? null;
      if (previousParentId !== nextParentId) {
        invalidateChildren(this.cacheKey, previousParentId);
        invalidateChildren(this.cacheKey, nextParentId);
      }
    }

    return result;
  }

  async delete(id: string): Promise<ResultApp<void, AppErr>> {
    const cached = getCachedPanel(this.cacheKey, id);
    const result = await this.inner.delete(id);

    if (isOk(result)) {
      deleteCachedPanel(this.cacheKey, id);
      invalidateChildren(this.cacheKey, cached?.parentId?.id ?? null);
    }

    return result;
  }

  async deleteCascade(
    id: string,
  ): Promise<ResultApp<{ deletedIds: string[] }, AppErr>> {
    const cached = getCachedPanel(this.cacheKey, id);
    const result = await this.inner.deleteCascade(id);

    if (isOk(result)) {
      deleteCachedPanels(this.cacheKey, result.value.deletedIds);

      // Cualquiera de los ids borrados pudo haber sido, a su vez, padre de
      // otro panel — invalidamos su entrada en el registro de hijos para
      // que nadie intente listar hijos de un panel que ya no existe.
      for (const deletedId of result.value.deletedIds) {
        invalidateChildren(this.cacheKey, deletedId);
      }
      invalidateChildren(this.cacheKey, cached?.parentId?.id ?? null);
    }

    return result;
  }
}
