import { useContext } from "react";
import { NotesContext } from "../context/noteContext";

export function useNotes() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error("Necesitas tener el contexto dentro del provider");
  }

  return context;
}
