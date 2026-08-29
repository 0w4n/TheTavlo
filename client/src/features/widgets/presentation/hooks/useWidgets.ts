import { useContext } from "react";
import { WidgetsContext } from "../context/widgetsContext";

export default function useWidgets() {
  const context = useContext(WidgetsContext);
  if (!context) {
    throw new Error("useWidgets debe usarse dentro de WidgetsProvider");
  }
  return context;
}
