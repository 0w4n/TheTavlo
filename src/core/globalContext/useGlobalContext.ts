import { useContext } from "react";
import {GlobalContext} from "./globalContext";

export default function useGlobalContext() {
  const context = useContext(GlobalContext);
  console.info("useGlobalContext - context:", context);
  if (!context) {
    throw new Error("useGlobalContext debe usarse dentro de un GlobalContextProvider");
  }

  return context;
}
