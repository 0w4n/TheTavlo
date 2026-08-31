import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import "./input.css";
import Icon from "#shared/ui/atoms/icons";
export function Input({ variant = "default", size = "md", label, helperText, errorMessage, leftIcon, rightIcon, required = false, className = "", wrapperClassName = "", id, disabled, ...props }) {
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
    return (_jsxs("div", { className: wrapperClasses, children: [label && (_jsx("label", { htmlFor: inputId, className: `input__label ${required ? "input__label--required" : ""}`, children: label })), _jsxs("div", { className: "input-container", children: [leftIcon && (_jsx(Icon, { name: leftIcon, className: "input__icon input__icon--left", "aria-hidden": "true" })), _jsx("input", { id: inputId, className: inputClasses, disabled: disabled, required: required, "aria-invalid": finalVariant === "error" ? "true" : "false", "aria-describedby": errorMessage
                            ? errorMessageId
                            : helperText
                                ? helperTextId
                                : undefined, ...props }), rightIcon && (_jsx(Icon, { name: rightIcon, className: "input__icon input__icon--right", "aria-hidden": "true" }))] }), errorMessage && (_jsxs(_Fragment, { children: [_jsx(Icon, { name: "IconExclamationCircle" }), _jsx("span", { id: errorMessageId, className: "input__error-message", role: "alert", "aria-live": "polite", children: errorMessage })] })), !errorMessage && helperText && (_jsx("span", { id: helperTextId, className: "input__helper-text", children: helperText }))] }));
}
