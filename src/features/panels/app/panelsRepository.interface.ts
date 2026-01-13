import type { CreatePanelDTO, Panel,  UpdatePanelDTO } from "../domain/panel.entity";

export interface PanelRepository {
  findAll(): Promise<Panel[]>;
  findById(id: string): Promise<Panel | null>;
  create(data: CreatePanelDTO): Promise<Panel>;
  update(id: string, data: UpdatePanelDTO): Promise<Panel>;
  delete(id: string): Promise<void>;
  reorder(panelIds: string[]): Promise<void>;
  getStats(panelId: string): Promise<Panel["stats"]>;
}
