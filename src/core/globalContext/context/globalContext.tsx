import {
  createContext,
  type PropsWithChildren,
  useMemo,
  useState,
} from "react";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import type { GlobalContextProps } from "./globalContex.type";
import usePanels from "#features/panels/presentation/hooks/usePanels";

export type GlobalContextValue = {
  state: GlobalContextProps;
};

export const GlobalContext = createContext<GlobalContextValue | null>(null);

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
  const user = useAuth().state.user;
  const currentPanel = usePanels().state.currentPanel;

  useMemo(() => {
    console.log(user);
    console.log(currentPanel);
    if (!user || !currentPanel) return null;

    setState({
      user: {
        userId: user.id,
        accountType: user.accountType,
      },
      // theme: {
      //   mode: theme.config.mode,
      //   preset: theme.config.preset,
      //   fontSize: theme.config.fontSize,
      //   borderRadius: theme.config.borderRadius,
      //   animations: theme.config.animations,
      // },
      panel: {
        panelId: currentPanel.id,
      },
    });
  }, [user, currentPanel]);

  return (
    <GlobalContext.Provider value={{ state }}>
      {children}
    </GlobalContext.Provider>
  );
}
