import { UserRole, type CreatedInvitationDTO, type Invitation, type InvitationAccessResult, type SharedUser, type UpdatedInvitationDTO } from "../domain/invitation.entity";
import type { InvitationRepository } from "./invitationRepository.interface";
export declare class InvitationService {
    private invitationRepository;
    constructor(invitationRepository: InvitationRepository);
    getInvitationByToken(token: string): Promise<{
        invitation?: Invitation;
        error?: string;
    }>;
    createInvitation(data: CreatedInvitationDTO, parentRef: string): Promise<{
        invitation?: Invitation;
        error?: string;
    }>;
    updateInvitation(id: string, data: UpdatedInvitationDTO): Promise<{
        invitation: Invitation;
        error?: undefined;
    } | {
        error: string;
        invitation?: undefined;
    }>;
    deleteInvitation(token: string): Promise<{
        invitation: undefined;
        error?: undefined;
    } | {
        error: string;
        invitation?: undefined;
    }>;
    /**
     * Decide qué debe ver la persona que abre un enlace de invitación:
     * - Pública (LINK): cualquiera puede verla, esté o no logueado.
     * - Privada (USERS): solo si existe una entrada SharedUser para su id.
     *   Si está PENDING, la pantalla debe ofrecerle aceptar/rechazar.
     */
    resolveAccess(token: string, currentUserId: string): Promise<{
        result?: InvitationAccessResult;
        error?: string;
    }>;
    respondAsInvitee(invitationId: string, userId: string, accept: boolean): Promise<{
        sharedUser?: SharedUser;
        error?: string;
    }>;
    /**
     * Un visitante que entró con un enlace PÚBLICO pide convertirse en
     * usuario invitado reconocido. Queda en PENDING hasta que el autor del
     * panel lo acepte con respondToAccessRequest().
     */
    requestPrivateAccess(invitationId: string, userId: string, role?: UserRole): Promise<{
        sharedUser?: SharedUser;
        error?: string;
    }>;
    /** El autor del panel ve quién pidió (o ya tiene) acceso privado. */
    listAccessRequests(invitationId: string): Promise<{
        sharedUsers?: SharedUser[];
        error?: string;
    }>;
    /**
     * Solo el autor del panel puede aceptar o rechazar a alguien como
     * usuario invitado (conversión de público a privado).
     */
    respondToAccessRequest(invitationId: string, userId: string, approve: boolean): Promise<{
        sharedUser?: SharedUser;
        error?: string;
    }>;
}
