import type { HTMLAttributes } from "react";

export type CardVariant = "default" | "elevated" | "outlined" | "flat";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the card
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Whether the card is interactive (clickable/hoverable)
   */
  interactive?: boolean;

  /**
   * Content of the card
   */
  children: React.ReactNode;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the header
   */
  children: React.ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the body
   */
  children: React.ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the footer
   */
  children: React.ReactNode;
}
