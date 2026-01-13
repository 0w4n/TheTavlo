import { forwardRef, useEffect, useState, type SVGProps } from "react";

import iconsMap from "./iconsMap";
import iconNameToFile from "./utils";

type IconProps = {
  name: string;
  size?: number;
  stroke?: number;
} & SVGProps<SVGSVGElement>;

const svgCache = new Map<string, string>();

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, stroke, ...props }, ref) => {
    const [svg, setSvg] = useState<string | null>(null);

    useEffect(() => {
      const file = iconNameToFile(name);
      const path = `/node_modules/@tabler/icons/icons/outline/${file}.svg`;

      if (svgCache.has(path)) {
        setSvg(svgCache.get(path)!);
        return;
      }

      const loader = iconsMap[path];

      if (!loader) {
        console.error(`Tabler icon "${name}" not found, "${file}"`);
        console.info(path);
        console.info(iconsMap);
        return;
      }

      loader().then((raw: string) => {
        svgCache.set(path, raw);
        setSvg(raw);
      });
    }, [name]);

    if (!svg) return null;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        stroke={stroke}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        dangerouslySetInnerHTML={{ __html: svg }}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";

export default Icon;
