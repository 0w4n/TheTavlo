import type { HTMLAttributes } from "react";

export type QuoteVariant = "default" | "bordered" | "card" | "minimal";
export type QuoteSize = "sm" | "md" | "lg";

export interface QuoteProps extends HTMLAttributes<HTMLElement> {
  /**
   * The quote text
   */
  text: string;

  /**
   * Author of the quote
   */
  author: string;

  /**
   * Author's title or context (optional)
   */
  authorTitle?: string;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: QuoteVariant;

  /**
   * Size of the quote
   * @default 'md'
   */
  size?: QuoteSize;

  /**
   * Show quote marks
   * @default true
   */
  showQuoteMarks?: boolean;

  /**
   * Author avatar URL
   */
  authorAvatar?: string;
}
