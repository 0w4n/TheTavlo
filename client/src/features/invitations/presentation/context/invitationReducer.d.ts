import type { Invitation } from "#features/invitations/domain/invitation.entity";
export type InvitationsState = {
    invitation: Invitation | undefined;
    isLoading: boolean;
    error?: string;
};
type InvitationsAction = {
    type: "FETCH_INVITATION_START";
} | {
    type: "FETCH_INVITATION_SUCCESS";
    payload: Invitation;
} | {
    type: "FETCH_INVITATION_ERROR";
    payload: string;
} | {
    type: "CREATE_INVITATION_SUCCESS";
    payload: Invitation;
} | {
    type: "UPDATE_INVITATION_SUCCESS";
    payload: Invitation;
} | {
    type: "DELETE_INVITATION_SUCCESS";
    payload: string;
} | {
    type: "CLEAR_ERROR";
};
export declare const initialInvitationState: InvitationsState;
export declare function invitationReducer(state: InvitationsState, action: InvitationsAction): InvitationsState;
export {};
