import { jsx as _jsx } from "react/jsx-runtime";
import { InvitationMode, UserRole, } from "#features/invitations/domain/invitation.entity";
import { createContext, useCallback, useReducer, } from "react";
import { initialInvitationState, invitationReducer } from "./invitationReducer";
export const InvitationContext = createContext(undefined);
export function InvitationProvider({ children, invitationService, }) {
    const [state, dispatch] = useReducer(invitationReducer, initialInvitationState);
    const createInvitation = useCallback(async (data, parentRef) => {
        try {
            const payload = {
                ...data,
                lastUpdatedBy: "current-user",
                mode: InvitationMode.USERS,
                role: UserRole.EDITOR,
                token: "generated",
                newOwnerId: "current-user",
            };
            const newInvitation = await invitationService.createInvitation(payload, parentRef);
            if (!newInvitation) {
                dispatch({
                    type: "FETCH_INVITATION_ERROR",
                    payload: "Error al crear invitación: respuesta vacía",
                });
                throw new Error("No se pudo crear la invitación");
            }
            if (newInvitation.error) {
                dispatch({
                    type: "FETCH_INVITATION_ERROR",
                    payload: `Error al crear invitación: ${newInvitation.error}`,
                });
                throw new Error(newInvitation.error);
            }
            if (newInvitation.invitation) {
                dispatch({
                    type: "CREATE_INVITATION_SUCCESS",
                    payload: newInvitation.invitation,
                });
            }
        }
        catch (error) {
            dispatch({
                type: "FETCH_INVITATION_ERROR",
                payload: `Error al crear invitación: ${error}`,
            });
        }
    }, [invitationService]);
    const acceptInvitation = async (token) => {
        const invitationResult = await invitationService.getInvitationByToken(token);
        if (invitationResult.error) {
            dispatch({
                type: "FETCH_INVITATION_ERROR",
                payload: `Error al aceptar invitación: ${invitationResult.error}`,
            });
            return;
        }
    };
    const rejectInvitation = async (token) => {
        const invitationResult = await invitationService.getInvitationByToken(token);
        if (invitationResult.error) {
            dispatch({
                type: "FETCH_INVITATION_ERROR",
                payload: `Error al rechazar invitación: ${invitationResult.error}`,
            });
            return;
        }
    };
    const clearError = () => {
        dispatch({ type: "CLEAR_ERROR" });
    };
    const value = {
        invitation: state.invitation,
        createInvitation,
        acceptInvitation,
        rejectInvitation,
        clearError,
    };
    return (_jsx(InvitationContext.Provider, { value: value, children: children }));
}
