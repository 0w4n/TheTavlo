import { type PanelsContextValue, type PanelsProviderProps } from "./panelsContext.types";
export declare const PanelsContext: import("react").Context<PanelsContextValue | undefined>;
export declare function PanelsProvider({ children, panelsService, }: PanelsProviderProps): import("react").JSX.Element;
