import React, { useState } from "react";
import type { AlertProps } from "./alert.types";
import "./alert.css";
import Icon from "#shared/ui/atoms/icons";

const defaultIcons = {
  info: <Icon name="IconInfoCircle" />,
  success: <Icon name="IconSuccessCircle" />,
  warning: <Icon name="IconAlertCircle" />,
  error: <Icon name="IconExclamationCircle" />,
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
  };

  // Antes: `setTimeout(..., 300)` fijo. Con `prefers-reduced-motion`
  // activado, la animación real dura ~0ms (ver base/reset.css) pero el
  // desmontaje igual esperaba los 300ms completos. Esperar al evento real
  // mantiene ambos casos sincronizados sin tener que leer el media query
  // aquí también.
  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (isDismissing && e.animationName === "alert-dismiss-out") {
      setIsVisible(false);
      onDismiss?.();
    }
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
      onAnimationEnd={handleAnimationEnd}
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
          <Icon name="IconX" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = "Alert";