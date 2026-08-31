import React from "react";
import type { BadgeProps } from "./badge.types";
import "./badge.css";
/**
 * Badge component for status indicators, labels, and counts
 *
 * @example
 * ```tsx
 * <Badge variant="success">Activo</Badge>
 * <Badge variant="error" dot>Error</Badge>
 * <Badge variant="primary" icon={<CheckIcon />}>Verificado</Badge>
 * ```
 */
export declare const Badge: React.FC<BadgeProps>;
