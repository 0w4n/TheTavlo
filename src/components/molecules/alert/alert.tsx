import React, { useState } from "react";
import type { AlertProps } from "./alert.types";
import "./alert.css";

// Default icons for each variant
const InfoIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9 9h2v4H9V9zm0-4h2v2H9V5z"
      fill="currentColor"
    />
  </svg>
);

const SuccessIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1.707-6.707L13 6.586l1.414 1.414-6.121 6.121-3.535-3.535 1.414-1.414 2.121 2.121z"
      fill="currentColor"
    />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9 5h2v6H9V5zm0 8h2v2H9v-2z"
      fill="currentColor"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.707 7.293L10 8.586l1.293-1.293 1.414 1.414L11.414 10l1.293 1.293-1.414 1.414L10 11.414l-1.293 1.293-1.414-1.414L8.586 10 7.293 8.707l1.414-1.414z"
      fill="currentColor"
    />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15 5L5 15M5 5l10 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const defaultIcons = {
  info: <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
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
export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  icon,
  hideIcon = false,
  dismissible = false,
  onDismiss,
  children,
  className = "",
  ...props
}) => {
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

  return (
    <div
      className={classes}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      {...props}
    >
      {/* Icon */}
      {!hideIcon && (
        <div className="alert__icon" aria-hidden="true">
          {displayIcon}
        </div>
      )}

      {/* Content */}
      <div className="alert__content">
        {title && <div className="alert__title">{title}</div>}
        <div className="alert__message">{children}</div>
      </div>

      {/* Close Button */}
      {dismissible && (
        <button
          className="alert__close"
          onClick={handleDismiss}
          aria-label="Cerrar alerta"
          type="button"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

Alert.displayName = "Alert";
