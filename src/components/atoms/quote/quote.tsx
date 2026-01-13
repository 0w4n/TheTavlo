import React from "react";
import type { QuoteProps } from "./quote.types";
import "./quote.css";

/**
 * Quote component for displaying famous quotes
 *
 * @example
 * ```tsx
 * <Quote
 *   text="La vida es lo que pasa mientras estás ocupado haciendo otros planes"
 *   author="John Lennon"
 *   authorTitle="Músico y compositor"
 *   variant="card"
 * />
 * ```
 */
export const Quote: React.FC<QuoteProps> = ({
  text,
  author,
  authorTitle,
  variant = "default",
  size = "md",
  showQuoteMarks = true,
  authorAvatar,
  className = "",
  ...props
}) => {
  const classes = ["quote", `quote--${variant}`, `quote--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <blockquote className={classes} {...props}>
      {/* Quote Marks */}
      {showQuoteMarks && (
        <span className="quote__marks" aria-hidden="true">
          "
        </span>
      )}

      {/* Quote Text */}
      <p className="quote__text">{text}</p>

      {/* Divider */}
      <div className="quote__divider" />

      {/* Author */}
      <div className="quote__author-container">
        {authorAvatar && (
          <img src={authorAvatar} alt={author} className="quote__avatar" />
        )}
        <div className="quote__author-info">
          <cite className="quote__author">{author}</cite>
          {authorTitle && (
            <span className="quote__author-title">{authorTitle}</span>
          )}
        </div>
      </div>
    </blockquote>
  );
};

Quote.displayName = "Quote";
