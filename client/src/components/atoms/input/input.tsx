import React from "react";
import type { InputProps } from "./input.types";
import "./input.css";
import Icon from "#shared/ui/atoms/icons";

export function Input({
  variant = "default",
  size = "md",
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  required = false,
  className = "",
  wrapperClassName = "",
  id,
  disabled,
  ...props
}: InputProps) {
  const inputId = id || `input-${React.useId()}`;
  const helperTextId = `${inputId}-helper`;
  const errorMessageId = `${inputId}-error`;

  const finalVariant = errorMessage ? "error" : variant;

  const inputClasses = [
    "input",
    `input--${size}`,
    finalVariant !== "default" && `input--${finalVariant}`,
    leftIcon && "input--with-left-icon",
    rightIcon && "input--with-right-icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperClasses = ["input-wrapper", wrapperClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      {label && (
        <label
          htmlFor={inputId}
          className={`input__label ${required ? "input__label--required" : ""}`}
        >
          {label}
        </label>
      )}

      <div className="input-container">
        {leftIcon && (
          <Icon
            name={leftIcon}
            className="input__icon input__icon--left"
            aria-hidden="true"
          />
        )}

        <input
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          required={required}
          aria-invalid={finalVariant === "error" ? "true" : "false"}
          aria-describedby={
            errorMessage
              ? errorMessageId
              : helperText
                ? helperTextId
                : undefined
          }
          {...props}
        />

        {rightIcon && (
          <Icon
            name={rightIcon}
            className="input__icon input__icon--right"
            aria-hidden="true"
          />
        )}
      </div>

      {errorMessage && (
        <>
          <Icon name="IconExclamationCircle" />
          <span
            id={errorMessageId}
            className="input__error-message"
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </span>
        </>
      )}

      {!errorMessage && helperText && (
        <span id={helperTextId} className="input__helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
}
