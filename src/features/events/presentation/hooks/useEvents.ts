import { useContext } from "react";
import { EventsContext } from "../context/eventsContext";

export function useEvents() {
    const context = useContext(EventsContext);

    if (!context) {
      throw new Error("Necesitas tener el contexto dentro del provider");
    }

    return context
}