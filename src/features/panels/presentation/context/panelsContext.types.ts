import { DocumentReference } from "firebase/firestore";
import type { CreatePanelDTO, Panel, UpdatePanelDTO } from "../../domain/panel.entity";
import type { PanelsState } from "./panelReducer";
import type { PropsWithChildren } from "react";
import type { PanelsService } from "#features/panels/app/panels.service";

export enum returnTypes {
  PANEL = "panel",
  DOCREF = "docRef",
  STRING = "string",
  DEFAULT = "default"
}

export interface createOpt {
  return: returnTypes;
  addToParent: boolean;
}

export type PanelsContextValue = {
  state: PanelsState;
  fetchPanels: () => Promise<void>;
  fetchHomePanel: () => Promise<Panel>;
  //TODO: findById: (id: string) => Promise<Panel | undefined>;
  findByRef: (ref: DocumentReference) => Promise<Panel | undefined>;
  createPanel: (data: CreatePanelDTO, opt?: createOpt) => Promise<void | Panel | DocumentReference | Error>;
  addSubPanel: (
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ) => Promise<void>;
  updatePanel: (id: string, data: UpdatePanelDTO) => Promise<void>;
  deletePanel: (id: string) => Promise<void>;
  removeSubPanel: (
    parentId: DocumentReference,
    childId: DocumentReference,
  ) => Promise<void>;
  selectPanel: (panel: Panel) => void;
  clearError: () => void;
}

export type PanelsProviderProps = PropsWithChildren<{
  panelsService: PanelsService;
}>;
