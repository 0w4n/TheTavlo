import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
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
export const Quote = ({ text, author, authorTitle, variant = "default", size = "md", showQuoteMarks = true, authorAvatar, className = "", ...props }) => {
    const classes = ["quote", `quote--${variant}`, `quote--${size}`, className]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("blockquote", { className: classes, ...props, children: [showQuoteMarks && (_jsx("span", { className: "quote__marks", "aria-hidden": "true", children: "\"" })), _jsx("p", { className: "quote__text", children: text }), _jsx("div", { className: "quote__divider" }), _jsxs("div", { className: "quote__author-container", children: [authorAvatar && (_jsx("img", { src: authorAvatar, alt: author, className: "quote__avatar" })), _jsxs("div", { className: "quote__author-info", children: [_jsx("cite", { className: "quote__author", children: author }), authorTitle && (_jsx("span", { className: "quote__author-title", children: authorTitle }))] })] })] }));
};
Quote.displayName = "Quote";
