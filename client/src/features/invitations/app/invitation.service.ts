import {
  InvitationStatus,
  UserRole,
  isPublicSharedInvitation,
  isSharedInvitation,
  type CreatedInvitationDTO,
  type Invitation,
  type InvitationAccessResult,
  type PrivateInvitation,
  type SharedUser,
  type UpdatedInvitationDTO,
} from "../domain/invitation.entity";
import type { InvitationRepository } from "./invitationRepository.interface";

export class InvitationService {
  constructor(private invitationRepository: InvitationRepository) {}

  async getInvitationByToken(
    token: string,
  ): Promise<{ invitation?: Invitation; error?: string }> {
    try {
      const invitation = await this.invitationRepository.findByToken(token);
      return { invitation };
    } catch (error) {
      return { error: "Error al buscar la invitación" };
    }
  }

  async createInvitation(
    data: CreatedInvitationDTO,
    parentRef: string,
  ): Promise<{ invitation?: Invitation; error?: string }> {
    try {
      const invitation = await this.invitationRepository.create(
        data,
        parentRef,
      );
      return { invitation };
    } catch (error) {
      return { error: "Error al crear la invitación" };
    }
  }

  async updateInvitation(id: string, data: UpdatedInvitationDTO) {
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

  // ─── Resolución de acceso (lo usa la pantalla del enlace de invitación) ──

  /**
   * Decide qué debe ver la persona que abre un enlace de invitación:
   * - Pública (LINK): cualquiera puede verla, esté o no logueado.
   * - Privada (USERS): solo si existe una entrada SharedUser para su id.
   *   Si está PENDING, la pantalla debe ofrecerle aceptar/rechazar.
   */
  async resolveAccess(
    token: string,
    currentUserId: string,
  ): Promise<{ result?: InvitationAccessResult; error?: string }> {
    try {
      const invitation = await this.invitationRepository.findByToken(token);

      if (!invitation) return { result: { kind: "not-found" } };

      if (
        invitation.expiresAt &&
        invitation.expiresAt.toMillis() < Date.now()
      ) {
        return { result: { kind: "expired" } };
      }

      if (!isSharedInvitation(invitation)) {
        return { error: "Este enlace no es una invitación de tipo compartir" };
      }

      if (isPublicSharedInvitation(invitation)) {
        return { result: { kind: "public", invitation } };
      }

      const privateInvitation = invitation as PrivateInvitation;
      const sharedUser = await this.invitationRepository.findSharedUser(
        privateInvitation.id,
        currentUserId,
      );

      if (!sharedUser) {
        return {
          result: { kind: "not-invited", invitation: privateInvitation },
        };
      }

      if (sharedUser.status === InvitationStatus.REVOKED) {
        return { result: { kind: "revoked" } };
      }
      if (sharedUser.status === InvitationStatus.ACCEPTED) {
        return {
          result: {
            kind: "private-accepted",
            invitation: privateInvitation,
            sharedUser,
          },
        };
      }
      if (sharedUser.status === InvitationStatus.REJECTED) {
        return {
          result: {
            kind: "private-rejected",
            invitation: privateInvitation,
            sharedUser,
          },
        };
      }
      return {
        result: {
          kind: "private-pending",
          invitation: privateInvitation,
          sharedUser,
        },
      };
    } catch (error) {
      return { error: "Error al resolver el acceso a la invitación" };
    }
  }

  // ─── La persona invitada acepta/rechaza una invitación privada ──────────

  async respondAsInvitee(
    invitationId: string,
    userId: string,
    accept: boolean,
  ): Promise<{ sharedUser?: SharedUser; error?: string }> {
    try {
      const existing = await this.invitationRepository.findSharedUser(
        invitationId,
        userId,
      );
      if (!existing) return { error: "No estás invitado a este recurso" };

      const sharedUser = await this.invitationRepository.upsertSharedUser(
        invitationId,
        {
          userId,
          role: existing.role,
          status: accept
            ? InvitationStatus.ACCEPTED
            : InvitationStatus.REJECTED,
        },
      );
      return { sharedUser };
    } catch {
      return { error: "Error al responder a la invitación" };
    }
  }

  // ─── Público → Privado: el visitante pide pasar a ser invitado ─────────

  /**
   * Un visitante que entró con un enlace PÚBLICO pide convertirse en
   * usuario invitado reconocido. Queda en PENDING hasta que el autor del
   * panel lo acepte con respondToAccessRequest().
   */
  async requestPrivateAccess(
    invitationId: string,
    userId: string,
    role: UserRole = UserRole.VIEWER,
  ): Promise<{ sharedUser?: SharedUser; error?: string }> {
    try {
      const existing = await this.invitationRepository.findSharedUser(
        invitationId,
        userId,
      );
      if (existing) return { sharedUser: existing };

      const sharedUser = await this.invitationRepository.upsertSharedUser(
        invitationId,
        {
          userId,
          role,
          status: InvitationStatus.PENDING,
        },
      );
      return { sharedUser };
    } catch {
      return { error: "Error al solicitar acceso privado" };
    }
  }

  /** El autor del panel ve quién pidió (o ya tiene) acceso privado. */
  async listAccessRequests(
    invitationId: string,
  ): Promise<{ sharedUsers?: SharedUser[]; error?: string }> {
    try {
      const sharedUsers =
        await this.invitationRepository.listSharedUsers(invitationId);
      return { sharedUsers };
    } catch {
      return { error: "Error al listar las solicitudes de acceso" };
    }
  }

  /**
   * Solo el autor del panel puede aceptar o rechazar a alguien como
   * usuario invitado (conversión de público a privado).
   */
  async respondToAccessRequest(
    invitationId: string,
    userId: string,
    approve: boolean,
  ): Promise<{ sharedUser?: SharedUser; error?: string }> {
    try {
      const existing = await this.invitationRepository.findSharedUser(
        invitationId,
        userId,
      );
      if (!existing)
        return { error: "No hay ninguna solicitud de acceso de ese usuario" };

      const sharedUser = await this.invitationRepository.upsertSharedUser(
        invitationId,
        {
          userId,
          role: existing.role,
          status: approve
            ? InvitationStatus.ACCEPTED
            : InvitationStatus.REJECTED,
        },
      );
      return { sharedUser };
    } catch {
      return { error: "Error al responder a la solicitud de acceso" };
    }
  }
}
