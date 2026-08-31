import { useContext } from "react";
import { GlobalContext } from "../context/globalContext";
export default function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext debe usarse dentro de un GlobalContextProvider");
    }
    return context;
}
