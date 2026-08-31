import type { InvitationService } from "#features/invitations/app/invitation.service";
import {
  InvitationMode,
  UserRole,
  type CreatedAnyInvitationDTO,
  type Invitation,
} from "#features/invitations/domain/invitation.entity";
import {
  createContext,
  useCallback,
  useReducer,
  type PropsWithChildren,
} from "react";
import { initialInvitationState, invitationReducer } from "./invitationReducer";

type InvitationContextValue = {
  invitation: Invitation | undefined;
  createInvitation: (
    data: Omit<
      CreatedAnyInvitationDTO,
      "createdAt" | "updatedAt" | "token" | "objRef"
    >,
    parentRef: string,
  ) => Promise<void>;
  acceptInvitation: (id: string) => Promise<void>;
  rejectInvitation: (id: string) => Promise<void>;
  clearError: () => void;
};

export const InvitationContext = createContext<
  InvitationContextValue | undefined
>(undefined);

type InvitationProviderProps = PropsWithChildren<{
  invitationService: InvitationService;
}>;

export function InvitationProvider({
  children,
  invitationService,
}: InvitationProviderProps) {
  const [state, dispatch] = useReducer(
    invitationReducer,
    initialInvitationState,
  );

  const createInvitation = useCallback(
    async (
      data: Omit<
        CreatedAnyInvitationDTO,
        "createdAt" | "updatedAt" | "token" | "objRef"
      >,
      parentRef: string,
    ) => {
      try {
        const payload: CreatedAnyInvitationDTO = {
          ...data,
          lastUpdatedBy: "current-user",
          mode: InvitationMode.USERS,
          role: UserRole.EDITOR,
          token: "generated",
          newOwnerId: "current-user",
        } as CreatedAnyInvitationDTO;

        const newInvitation = await invitationService.createInvitation(
          payload,
          parentRef,
        );

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
      } catch (error) {
        dispatch({
          type: "FETCH_INVITATION_ERROR",
          payload: `Error al crear invitación: ${error}`,
        });
      }
    },
    [invitationService],
  );

  const acceptInvitation = async (token: string) => {
    const invitationResult =
      await invitationService.getInvitationByToken(token);

    if (invitationResult.error) {
      dispatch({
        type: "FETCH_INVITATION_ERROR",
        payload: `Error al aceptar invitación: ${invitationResult.error}`,
      });
      return;
    }
  };

  const rejectInvitation = async (token: string) => {
    const invitationResult =
      await invitationService.getInvitationByToken(token);

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

  const value: InvitationContextValue = {
    invitation: state.invitation,
    createInvitation,
    acceptInvitation,
    rejectInvitation,
    clearError,
  };


  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
}
