import type {
  CreateInvitationDTO,
  CreateSharedUserDTO,
  Invitation,
  SharedUser,
  UpdateInvitationDTO,
} from "../domain/invitation.entity";

export interface InvitationRepository {
  findByToken(token: string): Promise<Invitation | undefined>;
  create(data: CreateInvitationDTO, parentRef: string): Promise<Invitation>;
  update(id: string, data: UpdateInvitationDTO): Promise<Invitation>;
  delete(token: string): Promise<void>;

  // ─── Sub-colección invitedUsers (invitaciones privadas / solicitudes) ────

  /** Busca la entrada de un usuario concreto dentro de una invitación. */
  findSharedUser(
    invitationId: string,
    userId: string,
  ): Promise<SharedUser | undefined>;

  /** Lista todos los usuarios invitados/solicitantes de una invitación (vista del propietario). */
  listSharedUsers(invitationId: string): Promise<SharedUser[]>;

  /** Crea o reemplaza la entrada de un usuario dentro de una invitación. */
  upsertSharedUser(
    invitationId: string,
    data: CreateSharedUserDTO,
  ): Promise<SharedUser>;
}
