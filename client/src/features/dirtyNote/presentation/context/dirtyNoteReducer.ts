import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type {
  DirtyNote,
  DirtyNoteChanges,
} from "#features/dirtyNote/domain/DirtyNote.entity";

/**
 * `error` solo aplica a fallos de CARGA/suscripción. Un fallo al guardar,
 * crear o borrar se devuelve al que llamó (ver `DirtyNoteContext`) sin tocar
 * este estado: si no, un autosave fallido haría desaparecer toda la lista.
 */
export type DirtyNoteState =
  | { status: "loading" }
  | { status: "ready"; items: DirtyNote[] }
  | { status: "error"; error: AppErr };

export type DirtyNoteAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: DirtyNote[] }
  | { type: "FETCH_ERROR"; payload: AppErr }
  | { type: "CREATE_SUCCESS"; payload: DirtyNote }
  | { type: "UPDATE_SUCCESS"; payload: DirtyNoteChanges }
  | { type: "DELETE_SUCCESS"; payload: string };

export const initialDirtyNoteState: DirtyNoteState = { status: "loading" };

/** Más recientes primero. No muta el arreglo recibido. */
function sortByUpdatedDesc(items: DirtyNote[]): DirtyNote[] {
  return [...items].sort(
    (a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis(),
  );
}

export function dirtyNoteReducer(
  state: DirtyNoteState,
  action: DirtyNoteAction,
): DirtyNoteState {
  switch (action.type) {
    case "FETCH_START":
      return { status: "loading" };

    case "FETCH_SUCCESS":
      return { status: "ready", items: sortByUpdatedDesc(action.payload) };

    case "FETCH_ERROR":
      return { status: "error", error: action.payload };

    case "CREATE_SUCCESS": {
      if (state.status !== "ready") return state;
      // Upsert: con la suscripción en tiempo real, el snapshot puede llegar
      // ANTES de que resuelva la promesa de `create`. Sin esto se duplicaría.
      const others = state.items.filter((item) => item.id !== action.payload.id);
      return {
        status: "ready",
        items: sortByUpdatedDesc([...others, action.payload]),
      };
    }

    case "UPDATE_SUCCESS": {
      if (state.status !== "ready") return state;
      const changes = action.payload;
      // Fusiona los campos que cambiaron; NO reemplaza el objeto entero.
      return {
        status: "ready",
        items: sortByUpdatedDesc(
          state.items.map((item) =>
            item.id === changes.id ? { ...item, ...changes } : item,
          ),
        ),
      };
    }

    case "DELETE_SUCCESS":
      if (state.status !== "ready") return state;
      return {
        status: "ready",
        items: state.items.filter((item) => item.id !== action.payload),
      };

    default:
      return state;
  }
}
