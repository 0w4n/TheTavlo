import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import "./alert.css";
import Icon from "#shared/ui/atoms/icons";
const defaultIcons = {
    info: _jsx(Icon, { name: "IconInfoCircle" }),
    success: _jsx(Icon, { name: "IconSuccessCircle" }),
    warning: _jsx(Icon, { name: "IconAlertCircle" }),
    error: _jsx(Icon, { name: "IconExclamationCircle" }),
};
/**
 * Alert component for contextual feedback messages
 *
 * @example
 * ```tsx
 * <Alert variant="success" title="¡Éxito!" dismissible>
 *   Tu operación se completó correctamente.
 * </Alert>
 *
 * <Alert variant="error" onDismiss={() => console.log('Dismissed')}>
 *   Ocurrió un error al procesar tu solicitud.
 * </Alert>
 * ```
 */
export const Alert = ({ variant = "info", title, icon, hideIcon = false, dismissible = false, onDismiss, children, className = "", ...props }) => {
    const [isDismissing, setIsDismissing] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const handleDismiss = () => {
        setIsDismissing(true);
        // Esperar a que termine la animación
        setTimeout(() => {
            setIsVisible(false);
            if (onDismiss) {
                onDismiss();
            }
        }, 300); // Duración de la animación
    };
    if (!isVisible) {
        return null;
    }
    const classes = [
        "alert",
        `alert--${variant}`,
        isDismissing && "alert--dismissing",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    const displayIcon = icon || defaultIcons[variant];
    return (_jsxs("div", { className: classes, role: "alert", "aria-live": "polite", "aria-atomic": "true", ...props, children: [!hideIcon && (_jsx("div", { className: "alert__icon", "aria-hidden": "true", children: displayIcon })), _jsxs("div", { className: "alert__content", children: [title && _jsx("div", { className: "alert__title", children: title }), _jsx("div", { className: "alert__message", children: children })] }), dismissible && (_jsx("button", { className: "alert__close", onClick: handleDismiss, "aria-label": "Cerrar alerta", type: "button", children: _jsx(Icon, { name: "IconX" }) }))] }));
};
Alert.displayName = "Alert";
