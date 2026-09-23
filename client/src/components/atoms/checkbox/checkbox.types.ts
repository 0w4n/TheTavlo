import type { InputHTMLAttributes } from "react";

export type CheckBoxVariant = "rounded" | "square";

export interface CheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    variant: CheckBoxVariant;
}
