import React from "react";
import type { AlertProps } from "./alert.types";
import "./alert.css";
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
export declare const Alert: React.FC<AlertProps>;
