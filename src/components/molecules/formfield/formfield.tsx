import React, { forwardRef, useEffect, useRef } from "react";
import type { FormFieldProps } from "./formfield.types";
import "./formfiled.css";

const ErrorIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 1.33334C4.32 1.33334 1.33333 4.32001 1.33333 8.00001C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8.00001C14.6667 4.32001 11.68 1.33334 8 1.33334ZM8.66667 11.3333H7.33333V10H8.66667V11.3333ZM8.66667 8.66668H7.33333V4.66668H8.66667V8.66668Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * FormField component - Complete form field with label, input/textarea/select, and validation
 *
 * @example
 * ```tsx
 * // Input
 * <FormField
 *   label="Email"
 *   type="input"
 *   inputType="email"
 *   placeholder="tu@email.com"
 *   required
 * />
 *
 * // Textarea
 * <FormField
 *   label="Descripción"
 *   type="textarea"
 *   rows={4}
 *   helperText="Máximo 500 caracteres"
 * />
 *
 * // Select
 * <FormField
 *   label="País"
 *   type="select"
 *   options={[
 *     { value: 'es', label: 'España' },
 *     { value: 'mx', label: 'México' }
 *   ]}
 *   placeholder="Selecciona un país"
 * />
 * ```
 */
export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>((props, ref) => {
  const {
    label,
    helperText,
    errorMessage,
    required = false,
    wrapperClassName = "",
    id
  } = props;

  // Generate unique ID if not provided
  const fieldId = id || `field-${React.useId()}`;
  const helperTextId = `${fieldId}-helper`;
  const errorMessageId = `${fieldId}-error`;

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (props.type === "textarea" && props.autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      const adjustHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      };

      adjustHeight();
      textarea.addEventListener("input", adjustHeight);

      return () => {
        textarea.removeEventListener("input", adjustHeight);
      };
    }
  }, [props.type, props.type === "textarea" ? props.autoResize : false]);

  // Build wrapper classes
  const wrapperClasses = [
    "form-field",
    errorMessage && "form-field--error",
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(" ");

  // Render label
  const renderLabel = () => {
    if (!label) return null;

    return (
      <label
        htmlFor={fieldId}
        className={`form-field__label ${
          required ? "form-field__label--required" : ""
        }`}
      >
        {label}
      </label>
    );
  };

  // Render helper or error text
  const renderHelperText = () => {
    if (errorMessage) {
      return (
        <span
          id={errorMessageId}
          className="form-field__error-message"
          role="alert"
          aria-live="polite"
        >
          <span className="form-field__error-icon">
            <ErrorIcon />
          </span>
          {errorMessage}
        </span>
      );
    }

    if (helperText) {
      return (
        <span id={helperTextId} className="form-field__helper-text">
          {helperText}
        </span>
      );
    }

    return null;
  };

  // Common ARIA props
  const commonAriaProps = {
    "aria-invalid": !!errorMessage,
    "aria-describedby": errorMessage
      ? errorMessageId
      : helperText
      ? helperTextId
      : undefined,
    "aria-required": required ? true : undefined,
  };

  // Render field based on type
  const renderField = () => {
    if (props.type === "textarea") {
      const {
        type,
        autoResize,
        rows = 4,
        className = "",
        ...textareaProps
      } = props;

      return (
        <textarea
          ref={(el) => {
            textareaRef.current = el;
            if (typeof ref === "function") {
              ref(el);
            } else if (ref) {
              (
                ref as React.MutableRefObject<HTMLTextAreaElement | null>
              ).current = el;
            }
          }}
          id={fieldId}
          rows={rows}
          className={`form-field__textarea ${
            autoResize ? "form-field__textarea--auto-resize" : ""
          } ${className}`}
          {...commonAriaProps}
          {...textareaProps}
        />
      );
    }

    if (props.type === "select") {
      const {
        type,
        options,
        placeholder,
        className = "",
        ...selectProps
      } = props;

      return (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          id={fieldId}
          className={`form-field__select ${className}`}
          {...commonAriaProps}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Default: input
    const { type, className = "", ...inputProps } = props;

    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        id={fieldId}
        className={`form-field__input ${className}`}
        {...commonAriaProps}
        {...inputProps}
      />
    );
  };

  return (
    <div className={wrapperClasses}>
      {renderLabel()}
      {renderField()}
      {renderHelperText()}
    </div>
  );
});

FormField.displayName = "FormField";
