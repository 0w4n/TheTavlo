import { type Firestore } from "firebase/firestore";
import type { InvitationRepository } from "../app/invitationRepository.interface";
import type { Invitation, CreatedInvitationDTO, CreatedSharedUserDTO, SharedUser, UpdatedInvitationDTO } from "../domain/invitation.entity";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
export declare class FirebaseInvitationRepository implements InvitationRepository {
    private firestore;
    private getCurrentContext;
    constructor(firestore: Firestore, getCurrentContext: () => GlobalContextValue);
    private getCollectionPath;
    private getContext;
    private collectionRef;
    private docRef;
    findByToken(token: string): Promise<Invitation | undefined>;
    create(data: CreatedInvitationDTO, parentRef: string): Promise<Invitation>;
    update(id: string, data: UpdatedInvitationDTO): Promise<Invitation>;
    delete(token: string): Promise<void>;
    private invitedUsersCollectionPath;
    private invitedUsersCollectionRef;
    private invitedUserDocRef;
    findSharedUser(invitationId: string, userId: string): Promise<SharedUser | undefined>;
    listSharedUsers(invitationId: string): Promise<SharedUser[]>;
    upsertSharedUser(invitationId: string, data: CreatedSharedUserDTO): Promise<SharedUser>;
}
