import { useContext } from "react";
import { PanelsContext } from "../context/panelsContext";

export default function usePanels() {
  const context = useContext(PanelsContext);
  console.info("usePanels - context:", context);
  if (!context) {
    throw new Error("usePanels debe usarse dentro de PanelsProvider");
  }
  
  return context;
}
