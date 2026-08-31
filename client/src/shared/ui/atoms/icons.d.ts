import { type SVGProps } from "react";
type IconProps = {
    name: string;
    size?: number;
} & SVGProps<SVGSVGElement>;
declare const Icon: import("react").ForwardRefExoticComponent<Omit<IconProps, "ref"> & import("react").RefAttributes<SVGSVGElement>>;
export default Icon;
