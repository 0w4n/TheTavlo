import { pascalToKebab } from "./utils";

export default function Icon({
  name,
  stroke,
  color,
  size,
  className,
}: {
  name: string;
  stroke?: number;
  color?: string;
  size?: number
  className?: string;
}) {
  const { file, isFilled } = pascalToKebab(name);
  if (isFilled) {
    return (
      <>
        <i className={`ti ti-${file}-filled ${className}`} style={{"strokeWidth": stroke, "color": color, "fontSize": size }}></i>
      </>
    );
  } else {
    return (
      <>
        <i className={`ti ti-${file} ${className}`} style={{"strokeWidth": stroke, "color": color, "fontSize": size }}></i>
      </>
    );
  }
}
