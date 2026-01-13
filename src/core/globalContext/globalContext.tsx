import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import type { GlobalContextProps } from "./globalContex.type";
import useTheme from "#shared/themes/presentation/hooks/useTheme";
import { PanelsContext } from "#features/panels/presentation/context/panelsContext";

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
  theme: {
    mode: "system",
    preset: "default",
    fontSize: "medium",
    borderRadius: "rounded",
    animations: true,
  },
};

export default function GlobalContextProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<GlobalContextProps>(initialGlobalContext);
  const theme = useTheme();
  const { state: authState } = useAuth();
  const panelsContext = useContext(PanelsContext);

  if (!authState.user || !panelsContext) return null;

  const user = authState.user;
  const panel = panelsContext.state;

  useEffect(() => {
    if (!user || !panel) return;

    const value: GlobalContextProps = {
      user: {
        userId: user.id,
        accountType: user.accountType,
      },
      panel: {
        panelId: panel.panelId!,
      },
      theme: {
        mode: theme.config.mode,
        preset: theme.config.preset,
        fontSize: theme.config.fontSize,
        borderRadius: theme.config.borderRadius,
        animations: theme.config.animations,
      },
    };

    setState(value);
    console.log(value);
  }, [user, panel, theme]);

  const value: GlobalContextValue = {
    state,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}
