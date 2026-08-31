export const initialInvitationState = {
    invitation: undefined,
    isLoading: false,
    error: undefined,
};
export function invitationReducer(state, action) {
    switch (action.type) {
        case "FETCH_INVITATION_START":
            return { ...state, isLoading: true, error: undefined };
        case "FETCH_INVITATION_SUCCESS":
            return { ...state, isLoading: false, invitation: action.payload };
        case "FETCH_INVITATION_ERROR":
            return { ...state, isLoading: false, error: action.payload };
        case "CREATE_INVITATION_SUCCESS":
            return { ...state, invitation: action.payload };
        case "UPDATE_INVITATION_SUCCESS":
            return {
                ...state,
                invitation: state.invitation && state.invitation.id === action.payload.id ? action.payload : state.invitation,
            };
        case "DELETE_INVITATION_SUCCESS":
            return {
                ...state,
                invitation: state.invitation?.id === action.payload ? undefined : state.invitation,
            };
        case "CLEAR_ERROR":
            return { ...state, error: undefined };
        default:
            return state;
    }
}
