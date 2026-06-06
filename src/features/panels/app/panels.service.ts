import type { DocumentReference } from "firebase/firestore";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import PanelRules from "../domain/panel.rules";
import type { PanelRepository } from "./panelsRepository.interface";
import { err, type ResultApp, type AppErr, notFoundErr, isErr, validationErr } from "#core/appCore/domain/AppCore.type";

export class PanelsService {
  constructor(private repository: PanelRepository) {}

  // ─── Read ────────────────────────────────────────────────────────────────

  async getAllPanels(): Promise<ResultApp<Panel[], AppErr>> {
    const result = await this.repository.findAll();

    if (isErr(result)) return result;

    return result;
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

  // ─── Create ──────────────────────────────────────────────────────────────

  async createPanel(
    data: CreatePanelDTO,
    parentId: string = "root",
  ): Promise<ResultApp<Panel, AppErr>> {
    const nameError = PanelRules.validateName(data.name);
    if (nameError) {
      return err(validationErr(nameError, { name: nameError }));
    }

    const result = await this.repository.create(data, parentId);
    return result;
  }

  // ─── Sub-panel linking ───────────────────────────────────────────────────

  async addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>> {
    return this.repository.addSubPanel(parentRef, childRef);
  }

  // ─── Update ──────────────────────────────────────────────────────────────

  async updatePanel(
    id: string,
    data: UpdatePanelDTO,
  ): Promise<ResultApp<Panel, AppErr>> {
    if (data.name) {
      const nameError = PanelRules.validateName(data.name);
      if (nameError) {
        return err(validationErr(nameError, { name: nameError }));
      }
    }

    return this.repository.update(id, data);
  }

  // ─── Delete ──────────────────────────────────────────────────────────────

  async deletePanel(id: string): Promise<ResultApp<void, AppErr>> {
    const findResult = await this.repository.findById(id);

    if (isErr(findResult)) return findResult;

    const panel = findResult.value;

    if (!panel) {
      return err(notFoundErr(`Panel con id "${id}" no encontrado`));
    }

    if (!PanelRules.canDelete(panel)) {
      return err(
        validationErr("No se puede eliminar el panel por defecto", {
          id: "Panel marcado como isDefault",
        }),
      );
    }

    return this.repository.delete(id);
  }
}
