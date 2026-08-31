import { InvitationStatus, UserRole, isPublicSharedInvitation, isSharedInvitation, } from "../domain/invitation.entity";
export class InvitationService {
    constructor(invitationRepository) {
        Object.defineProperty(this, "invitationRepository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: invitationRepository
        });
    }
    async getInvitationByToken(token) {
        try {
            const invitation = await this.invitationRepository.findByToken(token);
            return { invitation };
        }
        catch (error) {
            return { error: "Error al buscar la invitación" };
        }
    }
    async createInvitation(data, parentRef) {
        try {
            const invitation = await this.invitationRepository.create(data, parentRef);
            return { invitation };
        }
        catch (error) {
            return { error: "Error al crear la invitación" };
        }
    }
    async updateInvitation(id, data) {
        try {
            const invitation = await this.invitationRepository.update(id, data);
            return { invitation };
        }
        catch (error) {
            return { error: "Error al actualizar la invitación" };
        }
    }
    async deleteInvitation(token) {
        try {
            await this.invitationRepository.delete(token);
            return { invitation: undefined };
        }
        catch (error) {
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
    async resolveAccess(token, currentUserId) {
        try {
            const invitation = await this.invitationRepository.findByToken(token);
            if (!invitation)
                return { result: { kind: "not-found" } };
            if (invitation.expiresAt &&
                invitation.expiresAt.toMillis() < Date.now()) {
                return { result: { kind: "expired" } };
            }
            if (!isSharedInvitation(invitation)) {
                return { error: "Este enlace no es una invitación de tipo compartir" };
            }
            if (isPublicSharedInvitation(invitation)) {
                return { result: { kind: "public", invitation } };
            }
            const privateInvitation = invitation;
            const sharedUser = await this.invitationRepository.findSharedUser(privateInvitation.id, currentUserId);
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
        }
        catch (error) {
            return { error: "Error al resolver el acceso a la invitación" };
        }
    }
    // ─── La persona invitada acepta/rechaza una invitación privada ──────────
    async respondAsInvitee(invitationId, userId, accept) {
        try {
            const existing = await this.invitationRepository.findSharedUser(invitationId, userId);
            if (!existing)
                return { error: "No estás invitado a este recurso" };
            const sharedUser = await this.invitationRepository.upsertSharedUser(invitationId, {
                userId,
                role: existing.role,
                status: accept
                    ? InvitationStatus.ACCEPTED
                    : InvitationStatus.REJECTED,
            });
            return { sharedUser };
        }
        catch {
            return { error: "Error al responder a la invitación" };
        }
    }
    // ─── Público → Privado: el visitante pide pasar a ser invitado ─────────
    /**
     * Un visitante que entró con un enlace PÚBLICO pide convertirse en
     * usuario invitado reconocido. Queda en PENDING hasta que el autor del
     * panel lo acepte con respondToAccessRequest().
     */
    async requestPrivateAccess(invitationId, userId, role = UserRole.VIEWER) {
        try {
            const existing = await this.invitationRepository.findSharedUser(invitationId, userId);
            if (existing)
                return { sharedUser: existing };
            const sharedUser = await this.invitationRepository.upsertSharedUser(invitationId, {
                userId,
                role,
                status: InvitationStatus.PENDING,
            });
            return { sharedUser };
        }
        catch {
            return { error: "Error al solicitar acceso privado" };
        }
    }
    /** El autor del panel ve quién pidió (o ya tiene) acceso privado. */
    async listAccessRequests(invitationId) {
        try {
            const sharedUsers = await this.invitationRepository.listSharedUsers(invitationId);
            return { sharedUsers };
        }
        catch {
            return { error: "Error al listar las solicitudes de acceso" };
        }
    }
    /**
     * Solo el autor del panel puede aceptar o rechazar a alguien como
     * usuario invitado (conversión de público a privado).
     */
    async respondToAccessRequest(invitationId, userId, approve) {
        try {
            const existing = await this.invitationRepository.findSharedUser(invitationId, userId);
            if (!existing)
                return { error: "No hay ninguna solicitud de acceso de ese usuario" };
            const sharedUser = await this.invitationRepository.upsertSharedUser(invitationId, {
                userId,
                role: existing.role,
                status: approve
                    ? InvitationStatus.ACCEPTED
                    : InvitationStatus.REJECTED,
            });
            return { sharedUser };
        }
        catch {
            return { error: "Error al responder a la solicitud de acceso" };
        }
    }
}
