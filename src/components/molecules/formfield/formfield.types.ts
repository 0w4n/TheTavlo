import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";

export type FormFieldType = "input" | "textarea" | "select";

export interface BaseFormFieldProps {
  /**
   * Label for the form field
   */
  label?: string;

  /**
   * Helper text shown below the field
   */
  helperText?: string;

  /**
   * Error message shown below the field
   */
  errorMessage?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Additional CSS class for the wrapper
   */
  wrapperClassName?: string;

  /**
   * ID for the field (auto-generated if not provided)
   */
  id?: string;
}

export interface InputFormFieldProps
  extends BaseFormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /**
   * Type of form field
   */
  type?: "input";
}

export interface TextareaFormFieldProps
  extends BaseFormFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  /**
   * Type of form field
   */
  type: "textarea";

  /**
   * Number of visible text lines
   */
  rows?: number;

  /**
   * Whether to auto-resize based on content
   */
  autoResize?: boolean;
}

export interface SelectFormFieldProps
  extends BaseFormFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  /**
   * Type of form field
   */
  type: "select";

  /**
   * Options for the select
   */
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;

  /**
   * Placeholder option
   */
  placeholder?: string;
}

export type FormFieldProps =
  | InputFormFieldProps
  | TextareaFormFieldProps
  | SelectFormFieldProps;
