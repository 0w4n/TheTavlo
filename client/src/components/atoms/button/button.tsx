import React, { type ReactNode } from "react";
import "../../base/colors.css"
import Icon from "#shared/ui/atoms/icons";

import "./button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconPosition?: "left" | "right";
  iconClassName?: string;
  label?: string;
  iconSize?: number;
  iconColor?: string;
  isLoading?: boolean;
  children?: ReactNode;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  iconClassName,
  label,
  iconSize,
  iconColor,
  isLoading = false,
  className = "",
  disabled,
  children,
  href,
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
        <>
          <span className="button__spinner" aria-hidden="true" />
          <span className="button__sr-only">Cargando…</span>
          {label && <span aria-hidden="true">{label}</span>}
        </>
      ) : icon && label ? (
        <>
          {iconPosition === "left" && (
            <Icon name={icon} className={iconClassName} color={iconColor} size={iconSize ?? 24} />
          )}
          <span>{label}</span>
          {iconPosition === "right" && (
            <Icon name={icon} className={iconClassName} color={iconColor} size={iconSize ?? 24} />
          )}
        </>
      ) : icon != undefined ? (
        <Icon name={icon} className={iconClassName} color={iconColor} size={iconSize ?? 24} />
      ) : label ? (
        <span>{label}</span>
      ) : href ? (
        <a href={href} className="button__link">
          {children}
        </a>
      ) : null}
      {children}
    </button>
  );
};