import { useCallback, useRef, useState, type ReactNode } from "react";
import { AnnouncerContext, type Announce } from "./announcerContext";

/**
 * Anuncia cambios de navegación (u otros eventos) a usuarios de lector de
 * pantalla en una SPA. En una navegación por React Router no hay recarga de
 * página, así que el lector de pantalla nunca se entera "solo" de que
 * cambiaste de panel — el breadcrumb visual no sirve de nada si no se
 * anuncia también por este canal.
 *
 * Por qué un Provider con dos regiones fijas en vez de una por componente:
 * - Una región `aria-live` solo dispara el anuncio si YA estaba montada en
 *   el DOM antes de cambiar su contenido. Si cada página montara su propia
 *   región, se perdería el primer anuncio de cada navegación (la región se
 *   crea y llena en el mismo render).
 * - Dos regiones alternadas (en vez de una sola) evitan el caso en que se
 *   navega dos veces seguidas al mismo texto ("Tareas" → otro panel →
 *   "Tareas" de nuevo): si el texto no cambia, algunos lectores de pantalla
 *   no vuelven a anunciarlo.
 */

const hiddenStyle: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [messageA, setMessageA] = useState("");
  const [messageB, setMessageB] = useState("");
  const toggleRef = useRef(false);

  const announce = useCallback<Announce>((message) => {
    // Alterna entre las dos regiones para que un mismo texto repetido
    // siempre "cambie" el contenido de al menos una de las dos.
    toggleRef.current = !toggleRef.current;
    if (toggleRef.current) {
      setMessageA(message);
    } else {
      setMessageB(message);
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={hiddenStyle}>
        {messageA}
      </div>
      <div aria-live="polite" aria-atomic="true" style={hiddenStyle}>
        {messageB}
      </div>
    </AnnouncerContext.Provider>
  );
}
