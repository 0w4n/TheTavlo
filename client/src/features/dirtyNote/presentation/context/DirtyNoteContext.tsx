import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import type { AppErr, ResultApp } from "#core/appCore/domain/AppCore.type";
import type { DirtyNoteService } from "#features/dirtyNote/app/DirtyNote.service";
import type {
  CreateDirtyNoteDTO,
  DirtyNote,
  DirtyNoteChanges,
  UpdateDirtyNoteDTO,
} from "#features/dirtyNote/domain/DirtyNote.entity";
import {
  dirtyNoteReducer,
  initialDirtyNoteState,
  type DirtyNoteState,
} from "./dirtyNoteReducer";

export type DirtyNoteContextValue = {
  state: DirtyNoteState;
  createDirtyNote: (
    data: CreateDirtyNoteDTO,
  ) => Promise<ResultApp<DirtyNote, AppErr>>;
  updateDirtyNote: (
    id: string,
    data: UpdateDirtyNoteDTO,
  ) => Promise<ResultApp<DirtyNoteChanges, AppErr>>;
  deleteDirtyNote: (id: string) => Promise<ResultApp<void, AppErr>>;
};

export const DirtyNoteContext = createContext<DirtyNoteContextValue | undefined>(
  undefined,
);

type DirtyNoteProviderProps = PropsWithChildren<{
  dirtyNoteService: DirtyNoteService;
}>;

export function DirtyNoteProvider({
  children,
  dirtyNoteService,
}: DirtyNoteProviderProps) {
  const [state, dispatch] = useReducer(
    dirtyNoteReducer,
    initialDirtyNoteState,
  );

  // `dirtyNoteService` se recrea cuando cambia el usuario o el panel activo
  // (ver ProviderApp en App.tsx), lo que reinicia la suscripción sola para
  // el nuevo panel.
  useEffect(() => {
    dispatch({ type: "FETCH_START" });

    return dirtyNoteService.subscribe(
      (items) => dispatch({ type: "FETCH_SUCCESS", payload: items }),
      (error) => dispatch({ type: "FETCH_ERROR", payload: error }),
    );
  }, [dirtyNoteService]);

  // Las mutaciones devuelven el resultado en vez de lanzar: el que llama
  // (editor, formulario) decide cómo mostrar el error.

  const createDirtyNote = useCallback(
    async (data: CreateDirtyNoteDTO) => {
      const result = await dirtyNoteService.create(data);
      if (result.success) {
        dispatch({ type: "CREATE_SUCCESS", payload: result.value });
      }
      return result;
    },
    [dirtyNoteService],
  );

  const updateDirtyNote = useCallback(
    async (id: string, data: UpdateDirtyNoteDTO) => {
      const result = await dirtyNoteService.update(id, data);
      if (result.success) {
        dispatch({ type: "UPDATE_SUCCESS", payload: result.value });
      }
      return result;
    },
    [dirtyNoteService],
  );

  const deleteDirtyNote = useCallback(
    async (id: string) => {
      const result = await dirtyNoteService.delete(id);
      if (result.success) {
        dispatch({ type: "DELETE_SUCCESS", payload: id });
      }
      return result;
    },
    [dirtyNoteService],
  );

  const value = useMemo<DirtyNoteContextValue>(
    () => ({ state, createDirtyNote, updateDirtyNote, deleteDirtyNote }),
    [state, createDirtyNote, updateDirtyNote, deleteDirtyNote],
  );

  return (
    <DirtyNoteContext.Provider value={value}>
      {children}
    </DirtyNoteContext.Provider>
  );
}
