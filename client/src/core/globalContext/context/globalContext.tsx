import { type PropsWithChildren, useEffect, useMemo, useReducer } from "react";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { GlobalContext, type GlobalContextValue } from "./globalContex.type";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import {
  globalContextReducer,
  initialGlobalContext,
} from "./globalContextReducer";

export function GlobalContextProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    globalContextReducer,
    initialGlobalContext,
  );
  // const theme = useTheme();
  const userState = useAuth().state;
  const panelState = usePanels().state;
  const authenticatedUser =
    userState.status === "authenticated" ? userState.user : undefined;
  const currentPanel =
    panelState.status === "panel" ? panelState.currentPanel : undefined;

  useEffect(() => {
    if (!authenticatedUser) return;

    dispatch({
      type: "SET_USER",
      payload: {
        userId: authenticatedUser.id,
        accountType: authenticatedUser.accountType,
      },
    });
  }, [authenticatedUser?.id, authenticatedUser?.accountType]);

  useEffect(() => {
    if (!currentPanel) return;

    dispatch({
      type: "SET_PANEL",
      payload: {
        ownerId: currentPanel.ownerId,
        ownerAccountType: currentPanel.ownerAccountType,
        panelId: currentPanel.id,
      },
    });
  }, [
    currentPanel?.id,
    currentPanel?.ownerId,
    currentPanel?.ownerAccountType,
  ]);

  const value = useMemo<GlobalContextValue>(() => ({ state }), [state]);

  return (
    <GlobalContext.Provider value={value}> {children} </GlobalContext.Provider>
  );
}
