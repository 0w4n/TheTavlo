import React, { forwardRef } from "react";
import type { InputProps } from "./input.types";
import "./Input.css";

function InputFn(
  {
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
  }: InputProps,
  ref: React.Ref<HTMLInputElement>
) {
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
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`input__label ${required ? "input__label--required" : ""}`}
        >
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="input-container">
        {leftIcon && (
          <span className="input__icon input__icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
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
          <span className="input__icon input__icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {errorMessage && (
        <span
          id={errorMessageId}
          className="input__error-message"
          role="alert"
          aria-live="polite"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8 1.33334C4.32 1.33334 1.33333 4.32001 1.33333 8.00001C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8.00001C14.6667 4.32001 11.68 1.33334 8 1.33334ZM8.66667 11.3333H7.33333V10H8.66667V11.3333ZM8.66667 8.66668H7.33333V4.66668H8.66667V8.66668Z"
              fill="currentColor"
            />
          </svg>
          {errorMessage}
        </span>
      )}

      {!errorMessage && helperText && (
        <span id={helperTextId} className="input__helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
}

const Input = forwardRef(InputFn);
Input.displayName = "Input";

export default Input;
