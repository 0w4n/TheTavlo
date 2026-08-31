import React, { type ReactNode } from "react";
import "../../base/colors.css";
import "./button.css";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
    icon?: string;
    label?: string;
    iconSize?: number;
    iconColor?: string;
    isLoading?: boolean;
    children?: ReactNode;
}
export declare const Button: React.FC<ButtonProps>;
