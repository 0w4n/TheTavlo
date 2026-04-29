import React from "react";
import "../../base/colors.css"
import Icon from "#shared/ui/atoms/icons";

import "./button.css";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  label?: string;
  iconSize?: number;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  label,
  iconSize,
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const classes = [
    "button",
    `button__${variant}`,
    `button__${size}`,
    isLoading && "button__loading",
    icon && "button__icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="button__icon">⏳</span>
      ) : (icon && label) ? (
        <>
          <Icon name={icon} size={iconSize ?? 24} />
          <span>{label}</span>
        </>
      ) : icon != undefined ? (
        <Icon name={icon} size={iconSize ?? 24} />
      ) : label ? (
        <span>{label}</span>
      ) : null}
    </button>
  );
};
