import { forwardRef, useEffect, useState, type SVGProps } from "react";
import iconsMap from "./iconsMap";
import { pascalToKebab, extractSvgContent } from "./utils";

type IconProps = {
  name: string;
  size?: number;
  stroke?: number;
} & SVGProps<SVGSVGElement>;

const svgCache = new Map<string, string>();

const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      size = 24,
      stroke = 1.5,
      className,
      color = "var(--color-iconColor)",
      ...props
    },
    ref,
  ) => {
    const [svg, setSvg] = useState<string | null>(null);

    useEffect(() => {
      const {file, isFilled} = pascalToKebab(name);
      let path = "" 
      
      if (isFilled) {
        path = `/node_modules/@tabler/icons/icons/filled/${file}.svg`
      } else {
        path = `/node_modules/@tabler/icons/icons/outline/${file}.svg`;
      }

      if (svgCache.has(path)) {
        setSvg(svgCache.get(path)!);
        return;
      }

      const loader = iconsMap[path];

      if (!loader) {
        console.error(`Tabler icon "${name}" not found → "${file}"`);
        return;
      }

      loader().then((raw: string) => {
        svgCache.set(path, raw);
        setSvg(raw);
        console.debug(`Loaded Tabler icon "${name}" from "${path}"`);
      });
    }, [name]);

    if (!svg) return null;

    const content = extractSvgContent(svg);

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        ref={ref}
        className={className}
        stroke-linecap="round"
        stroke-linejoin="round"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        strokeWidth={stroke}
        fill={name.toLowerCase().includes("filled") ? "currentColor" : "none"}
        color={color}
        stroke="currentColor"
        dangerouslySetInnerHTML={{ __html: content }}
        {...props}
      />
    );
  },
);

Icon.displayName = "Icon";

export default Icon;
