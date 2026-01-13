import type {
  CreateWidgetDTO,
  UpdateWidgetDTO,
  Widget,
  WidgetLayout,
} from "../domain/widget.entity";

export interface WidgetRepository {
  findByPanel(panelId: string): Promise<Widget[]>;
  findById(id: string, panelId: string): Promise<Widget | null>;
  create(data: CreateWidgetDTO): Promise<Widget>;
  update(id: string, data: UpdateWidgetDTO): Promise<Widget>;
  updateLayout(id: string, layout: WidgetLayout): Promise<Widget>;
  updateBulkLayouts(
    updates: Array<{ id: string; layout: WidgetLayout }>
  ): Promise<void>;
  delete(id: string): Promise<void>;
}
