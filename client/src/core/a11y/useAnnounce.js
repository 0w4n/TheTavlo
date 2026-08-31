import { useContext } from "react";
import { AnnouncerContext } from "./announcerContext";
/** Devuelve una función `announce(mensaje)`. Nunca tira, aunque no haya Provider. */
export default function useAnnounce() {
    return useContext(AnnouncerContext);
}
