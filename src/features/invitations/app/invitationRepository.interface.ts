import type {
  CreateInvitationDTO,
  Invitation,
  UpdateInvitationDTO,
} from "../domain/invitation.entity";

export interface InvitationRepository {
  findByToken(token: string): Promise<Invitation | undefined>;
  create(
    data: CreateInvitationDTO,
    parentRef: string,
  ): Promise<Invitation>;
  update(id: string, data: UpdateInvitationDTO): Promise<Invitation>;
  delete(token: string): Promise<void>;
}
