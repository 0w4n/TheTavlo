import React from "react";
import type { FormFieldProps } from "./formfield.types";
import "./formfiled.css";
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
export declare const FormField: React.ForwardRefExoticComponent<FormFieldProps & React.RefAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>>;
