import type { ResponsiveLayouts } from "react-grid-layout";
import type {
  CreateWidgetDTO,
  UpdateWidgetDTO,
  Widget
} from "../domain/widget.entity";

export interface WidgetRepository {
  findByPanel(panelId: string): Promise<Widget[]>;
  findById(id: string, panelId: string): Promise<Widget | null>;
  create(data: CreateWidgetDTO): Promise<Widget>;
  update(id: string, data: UpdateWidgetDTO): Promise<Widget>;
  updateLayout(layout: ResponsiveLayouts): Promise<Widget>;
  updateBulkLayouts(updates: {
    layout: ResponsiveLayouts;
    panelId: string;
  }): Promise<void>;
  delete(id: string): Promise<void>;
}
