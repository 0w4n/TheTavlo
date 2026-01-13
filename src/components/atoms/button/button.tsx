import React from "react";
import "./Button.css";
import "../../base/colors.css"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const classes = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    isLoading && "button--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="button__icon">⏳</span>
      ) : icon ? (
        <>{icon}</>
      ) : null}
      {children}
    </button>
  );
};
