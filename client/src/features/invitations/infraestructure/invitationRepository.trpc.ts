import { Timestamp, type DocumentReference } from "firebase/firestore";
import { trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { InvitationRepository } from "../app/invitationRepository.interface";
import { InvitationStatus, type CreatedInvitationDTO, type CreatedSharedUserDTO, type Invitation, type SharedUser, type UpdatedInvitationDTO } from "../domain/invitation.entity";
import type { SerializedInvitation, SerializedSharedUser } from "./invitationApiClient";

function reference(path: string | null): DocumentReference {
  const safePath = path ?? "";
  return { id: safePath.split("/").pop() ?? safePath, path: safePath } as DocumentReference;
}

function timestamp(value: number | null): Timestamp {
  return Timestamp.fromMillis(value ?? Date.now());
}

function invitation(value: SerializedInvitation): Invitation {
  return {
    ...value,
    type: value.type as Invitation["type"],
    targetRef: reference(value.targetRef?.path ?? null),
    createdAt: timestamp(value.createdAt),
    updatedAt: timestamp(value.updatedAt),
    expiresAt: value.expiresAt === null ? null : timestamp(value.expiresAt),
  } as Invitation;
}

function sharedUser(value: SerializedSharedUser): SharedUser {
  return {
    userId: value.userId ?? "",
    status: value.status as InvitationStatus,
    role: value.role,
    createdAt: timestamp(value.createdAt),
    updatedAt: timestamp(value.updatedAt),
    statusUpdatedAt: value.statusUpdatedAt === null ? null : timestamp(value.statusUpdatedAt),
  };
}

export class TrpcInvitationRepository implements InvitationRepository {
  constructor(_getContext: unknown) {}

  async findByToken(token: string): Promise<Invitation | undefined> {
    const result = await trpcQuery<SerializedInvitation | null>("invitations.findByToken", { token });
    return result ? invitation(result) : undefined;
  }

  async create(_data: CreatedInvitationDTO, _parentRef: string): Promise<Invitation> {
    throw new Error("Usa InvitationApiClient.inviteByEmail o createPublicLink para crear invitaciones.");
  }

  async update(_id: string, _data: UpdatedInvitationDTO): Promise<Invitation> {
    throw new Error("Las invitaciones se gestionan mediante los procedures de invitaciones.");
  }

  async delete(_token: string): Promise<void> {
    throw new Error("Las invitaciones se revocan mediante los procedures de invitaciones.");
  }

  async findSharedUser(invitationId: string, userId: string): Promise<SharedUser | undefined> {
    const result = await trpcQuery<SerializedSharedUser | null>("invitations.findSharedUser", { invitationId, userId });
    return result ? sharedUser(result) : undefined;
  }

  async listSharedUsers(invitationId: string): Promise<SharedUser[]> {
    const result = await trpcQuery<SerializedSharedUser[]>("invitations.listSharedUsers", { invitationId });
    return result.map(sharedUser);
  }

  async upsertSharedUser(_invitationId: string, _data: CreatedSharedUserDTO): Promise<SharedUser> {
    throw new Error("La respuesta a invitaciones debe usar InvitationApiClient.respond.");
  }
}
