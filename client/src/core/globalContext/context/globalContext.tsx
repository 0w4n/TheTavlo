import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import type { GlobalContextProps } from "./globalContex.type";
import usePanels from "#features/panels/presentation/hooks/usePanels";

export type GlobalContextValue = {
  state: GlobalContextProps;
};

export const GlobalContext = createContext<GlobalContextValue | undefined>(
  undefined,
);

const initialGlobalContext: GlobalContextProps = {
  user: {
    userId: "",
    accountType: "users",
  },
  panel: {
    panelId: "",
  },
  // theme: {
  //   mode: "system",
  //   preset: "default",
  //   fontSize: "medium",
  //   borderRadius: "rounded",
  //   animations: true,
  // },
};

export function GlobalContextProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<GlobalContextProps>(initialGlobalContext);
  // const theme = useTheme();
  const status = useAuth().state;
  const panelState = usePanels().state;

  useEffect(() => {
    if (status.status !== "authenticated") return;

    const user = status.user;

    setState((prev) => ({
      ...prev,
      user: {
        userId: user.id,
        accountType: user.accountType,
      },
    }));
  }, [status.status === "authenticated" ? status.user.id : null]);

  useEffect(() => {
    if (panelState.status !== "panel") return;

    const currentPanel = panelState.currentPanel;
    setState((prev) => ({
      ...prev,
      panel: {
        ownerId: currentPanel.ownerId,
        ownerAccountType: currentPanel.ownerAccountType,
        panelId: currentPanel.id,
      },
    }));
  }, [panelState.status === "panel" ? panelState.currentPanel.id : null]);

  const value = useMemo(() => ({ state }), [state]);

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}
