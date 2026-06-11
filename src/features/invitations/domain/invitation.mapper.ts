import { FeatureMapper, type Mapper } from "#core/appCore/domain/AppCore.mapper";
import type { CreateInvitationDTO, Invitation } from "./invitation.entity";

export const PanelMapper: Mapper<Invitation, CreateInvitationDTO> = FeatureMapper