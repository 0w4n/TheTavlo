import { useContext } from "react";
import { PanelsContext } from "../context/panelsContext";
export default function usePanels() {
    const context = useContext(PanelsContext);
    if (!context) {
        throw new Error("Necesitas tener el contexto dentro del provider");
    }
    return context;
}
