import type {
  CreateInvitationDTO,
  Invitation,
  UpdateInvitationDTO,
} from "../domain/invitation.entity";
import type { InvitationRepository } from "./invitationRepository.interface";

export class InvitationService {
  constructor(private invitationRepository: InvitationRepository) {}

  async getInvitationByToken(token: string): Promise<{ invitation?: Invitation; error?: string }> {
    try {
      const invitation = await this.invitationRepository.findByToken(token);
      return { invitation };
    } catch (error) {
      return { error: "Error al buscar la invitación" };
    }
  }

  async createInvitation(
    data: CreateInvitationDTO,
    parentRef: string,
  ): Promise<{ invitation?: Invitation; error?: string }> {
    try {
      const invitation = await this.invitationRepository.create(data, parentRef);
      return { invitation };
    } catch (error) {
      return { error: "Error al crear la invitación" };
    }
  }

  async updateInvitation(id: string, data: UpdateInvitationDTO) {
    try {
      const invitation = await this.invitationRepository.update(id, data);
      return { invitation };
    } catch (error) {
      return { error: "Error al actualizar la invitación" };
    }
  }

  async deleteInvitation(token: string) {
    try {
      await this.invitationRepository.delete(token);
      return { invitation: undefined };
    } catch (error) {
      return { error: "Error al eliminar la invitación" };
    }
  }
}
