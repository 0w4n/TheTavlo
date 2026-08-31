import type { NotesContextValue, NotesProviderProps } from "./noteContext.type";
export declare const NotesContext: import("react").Context<NotesContextValue | undefined>;
export declare function NotesProvider({ children, notesService }: NotesProviderProps): import("react").JSX.Element;
