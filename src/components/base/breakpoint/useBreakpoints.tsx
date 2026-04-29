import { useEffect, useState } from "react";
import { breakPoints } from "./breakpoints";

export default function useBreakpoints(Element: HTMLDivElement | null) {
  const [bp, setBp] = useState("d");

  useEffect(() => {
    if (!Element) return;

    const onResize = () => {
      const w = Element.offsetWidth;
      if (w < breakPoints.mv) setBp("mv");
      if (w < breakPoints.mh) setBp("mh");
      if (w < breakPoints.tv) setBp("tv");
      if (w < breakPoints.th) setBp("th");
      else setBp("d");
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return bp;
}
