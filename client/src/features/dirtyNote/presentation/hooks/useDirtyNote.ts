import { useContext } from "react";
import { DirtyNoteContext } from "../context/DirtyNoteContext";

export default function useDirtyNote() {
  const context = useContext(DirtyNoteContext);

  if (!context) {
    throw new Error("useDirtyNote debe usarse dentro de DirtyNoteProvider");
  }

  return context;
}
