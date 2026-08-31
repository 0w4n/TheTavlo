import {
  FeatureMapper,
  type Mapper,
} from "#core/appCore/domain/AppCore.mapper";
import type { CreatedInvitationDTO, Invitation } from "./invitation.entity";

export const PanelMapper: Mapper<Invitation, CreatedInvitationDTO> =
  FeatureMapper;
