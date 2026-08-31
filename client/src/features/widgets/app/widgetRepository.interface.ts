import type { ResponsiveLayouts } from "react-grid-layout";
import type {
  CreateWidgetDTO,
  UpdateWidgetDTO,
  Widget,
} from "../domain/widget.entity";
import type { Unsubscribe } from "firebase/firestore";

export interface WidgetRepository {
  subscribe(
    onData: (widgets: Widget[]) => void,
    onError: (err: string) => void,
  ): Unsubscribe;
  findByPanel(panelId: string): Promise<Widget[]>;
  findById(id: string, panelId: string): Promise<Widget | null>;
  create(data: CreateWidgetDTO): Promise<Widget>;
  update(id: string, data: UpdateWidgetDTO): Promise<Widget>;
  updateLayout(layout: ResponsiveLayouts): Promise<Widget>;
  updateBulkLayout(layout: ResponsiveLayouts): Promise<void>;
  delete(id: string): Promise<void>;
}
