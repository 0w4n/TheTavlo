import { type Announce } from "./announcerContext";
/** Devuelve una función `announce(mensaje)`. Nunca tira, aunque no haya Provider. */
export default function useAnnounce(): Announce;
