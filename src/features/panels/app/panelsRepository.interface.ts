import type { DocumentReference } from "firebase/firestore";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";

export interface PanelRepository {
  findAll(): Promise<Panel[]>;
  findHomePanel(): Promise<Panel>;
  findById(id: string): Promise<Panel | undefined>;
  findByRef(ref: DocumentReference): Promise<Panel | undefined>;
  create(data: CreatePanelDTO, parentId: string): Promise<Panel>;
  update(id: string, data: UpdatePanelDTO): Promise<Panel>;
  delete(id: string): Promise<void>;
}
