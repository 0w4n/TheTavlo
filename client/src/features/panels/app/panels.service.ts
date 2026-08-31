import type { DocumentReference, Unsubscribe } from "firebase/firestore";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import PanelRules from "../domain/panel.rules";
import { validatePanelChain } from "../domain/panelChain.validator";
import type { PanelRepository } from "./panelsRepository.interface";
import {
  ok,
  err,
  type ResultApp,
  type AppErr,
  notFoundErr,
  isErr,
  validationErr,
} from "#core/appCore/domain/AppCore.type";

export class PanelsService {
  constructor(private repository: PanelRepository) {}

  // ─── Suscripciones ────────────────────────────────────────────────────────

  /**
   * Escucha el panel "home" en tiempo real.
   * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
   */
  subscribeToHomePanel(
    onData: (panel: Panel) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.repository.subscribeToHomePanel(onData, onError);
  }

  /**
   * Escucha todos los paneles del usuario en tiempo real.
   * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
   */
  subscribeToAll(
    onData: (panels: Panel[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.repository.subscribeToAll(onData, onError);
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async getAllPanels(): Promise<ResultApp<Panel[], AppErr>> {
    return this.repository.findAll();
  }

  async getHomePanel(): Promise<ResultApp<Panel, AppErr>> {
    return this.repository.findHomePanel();
  }

  async getPanelById(
    id: string,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    return this.repository.findById(id);
  }

  async getPanelBySharedId(
    sharedId: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    return this.repository.findBySharedId(sharedId);
  }

  async getPanelByRef(
    ref: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    return this.repository.findByRef(ref);
  }

  async getDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>> {
    return this.repository.findDocRef(id);
  }

  async getSubPanels(
    parentId: DocumentReference,
  ): Promise<ResultApp<Panel[], AppErr>> {
    return this.repository.findByParentId(parentId);
  }

  async getArchivedPanels(
    parentRef: DocumentReference | null,
  ): Promise<ResultApp<Panel[] | undefined, AppErr>> {
    return this.repository.findArchived(parentRef);
  }

  /**
   * Resuelve una cadena de ids de panel tal como viene en la URL
   * (`home/:pid/:pid/:pid`) contra la base de datos, validando que cada
   * panel esté efectivamente anidado dentro del anterior. La URL nunca es
   * una fuente de verdad por sí sola: alguien puede escribir a mano
   * `/home/idA/idB` sin que `idB` sea hijo real de `idA`.
   *
   * A diferencia de la versión anterior (un `findById` secuencial por cada
   * `:pid`), esto pide TODA la cadena de una sola vez con `findManyByIds` —
   * si el repositorio inyectado es un `CachedPanelsRepository`, eso significa
   * que solo se leen de Firestore los paneles que todavía no estén en
   * memoria (en el caso común de re-visitar una cadena ya conocida, cero
   * lecturas). La validación de jerarquía en sí (`validatePanelChain`) es
   * pura y no vuelve a tocar la fuente.
   *
   * Devuelve la cadena completa (del más externo al más anidado) en Ok, o
   * el primer error de jerarquía que encuentre en Err.
   */
  async resolveChain(panelIds: string[]): Promise<ResultApp<Panel[], AppErr>> {
    if (panelIds.length === 0) return ok([]);

    const fetchResult = await this.repository.findManyByIds(panelIds);
    if (isErr(fetchResult)) return fetchResult;

    const panelsById = new Map(fetchResult.value.map((p) => [p.id, p]));
    const validation = validatePanelChain(panelIds, panelsById);

    if (!validation.valid) {
      if (validation.reason === "missing") {
        return err(notFoundErr(`El panel "${validation.panelId}" no existe`));
      }
      return err(
        validationErr(
          `El panel "${validation.panelId}" no está anidado correctamente en la cadena de la URL`,
          { panelIds: "La cadena de paneles en la URL no es válida" },
        ),
      );
    }

    return ok(panelIds.map((id) => panelsById.get(id) as Panel));
  }

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  async createPanel(
    data: CreatePanelDTO,
    parentId?: DocumentReference,
  ): Promise<ResultApp<Panel, AppErr>> {
    const nameError = PanelRules.validateName(data.name);
    if (nameError) return err(validationErr(nameError, { name: nameError }));
    return this.repository.create(data, parentId);
  }

  /** @deprecated Usar parentId en createPanel() en su lugar. */
  async addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>> {
    return this.repository.addSubPanel(parentRef, childRef);
  }

  async archivePanel(id: string): Promise<ResultApp<Panel, AppErr>> {
    return this.repository.archive(id);
  }

  async unarchivePanel(id: string): Promise<ResultApp<void, AppErr>> {
    return this.repository.unarchive(id);
  }

  async updatePanel(
    id: string,
    data: UpdatePanelDTO,
  ): Promise<ResultApp<Panel, AppErr>> {
    if (data.name) {
      const nameError = PanelRules.validateName(data.name);
      if (nameError) return err(validationErr(nameError, { name: nameError }));
    }
    return this.repository.update(id, data);
  }

  async deletePanel(id: string): Promise<ResultApp<void, AppErr>> {
    const findResult = await this.repository.findById(id);
    if (isErr(findResult)) return findResult;

    const panel = findResult.value;
    if (!panel) return err(notFoundErr(`Panel con id "${id}" no encontrado`));
    if (!PanelRules.canDelete(panel)) {
      return err(
        validationErr("No se puede eliminar el panel por defecto", {
          id: "Panel marcado como isDefault",
        }),
      );
    }

    return this.repository.delete(id);
  }

  /**
   * Elimina un panel y TODOS sus sub-paneles descendientes de forma atómica
   * (ver `FirebasePanelsRepository.deleteCascade`). Respeta la misma regla
   * que `deletePanel`: nunca se puede borrar el panel por defecto.
   */
  async deletePanelCascade(
    id: string,
  ): Promise<ResultApp<{ deletedIds: string[] }, AppErr>> {
    const findResult = await this.repository.findById(id);
    if (isErr(findResult)) return findResult;

    const panel = findResult.value;
    if (!panel) return err(notFoundErr(`Panel con id "${id}" no encontrado`));
    if (!PanelRules.canDelete(panel)) {
      return err(
        validationErr("No se puede eliminar el panel por defecto", {
          id: "Panel marcado como isDefault",
        }),
      );
    }

    return this.repository.deleteCascade(id);
  }

  async deletePanelArchive(
    id: string,
  ): Promise<ResultApp<string, AppErr>> {
    return this.repository.deleteArchived(id);
  }
}
