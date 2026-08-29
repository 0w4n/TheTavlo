import type { CreatePanelDTO, Panel } from "./panel.entity";
import { FeatureMapper, type Mapper } from "#core/appCore/domain/AppCore.mapper";

export const PanelMapper: Mapper<Panel, CreatePanelDTO> = FeatureMapper