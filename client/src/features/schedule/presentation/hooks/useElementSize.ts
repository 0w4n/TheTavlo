import { useEffect, useRef, useState } from "react";

/**
 * Tamaño en píxeles del elemento referenciado, vivo ante resize.
 *
 * react-grid-layout cambia el tamaño de un widget por arrastre sin que cambie
 * el viewport, así que las media queries no sirven para adaptar el
 * contenido: hay que medir el propio widget. (Para ajustes de estilo simples
 * se usan container queries en CSS; esto es para cuando cambia la
 * ESTRUCTURA del render, p. ej. parrilla de varios días vs. un solo día.)
 */
export default function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const read = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height },
      );
    };

    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
