import type { InputHTMLAttributes } from 'react';

export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Visual variant of the input
   * @default 'default'
   */
  variant?: InputVariant;
  
  /**
   * Size of the input
   * @default 'md'
   */
  size?: InputSize;
  
  /**
   * Label text for the input
   */
  label?: string;
  
  /**
   * Helper text shown below the input
   */
  helperText?: string;
  
  /**
   * Error message shown below the input (overrides helperText)
   */
  errorMessage?: string;
  
  /**
   * Icon to display on the left side of input
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display on the right side of input
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Whether the input is required
   */
  required?: boolean;
  
  /**
   * Additional CSS class for the wrapper
   */
  wrapperClassName?: string;
}
