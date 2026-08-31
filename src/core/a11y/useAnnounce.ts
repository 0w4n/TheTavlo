import { useContext } from "react";
import { AnnouncerContext, type Announce } from "./announcerContext";

/** Devuelve una función `announce(mensaje)`. Nunca tira, aunque no haya Provider. */
export default function useAnnounce(): Announce {
  return useContext(AnnouncerContext);
}
