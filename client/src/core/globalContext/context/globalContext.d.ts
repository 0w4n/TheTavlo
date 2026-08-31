import { type PropsWithChildren } from "react";
import type { GlobalContextProps } from "./globalContex.type";
export type GlobalContextValue = {
    state: GlobalContextProps;
};
export declare const GlobalContext: import("react").Context<GlobalContextValue | undefined>;
export declare function GlobalContextProvider({ children }: PropsWithChildren): import("react").JSX.Element;
