import React from "react";
import type { TooltipProps } from "./tooltip.types";
import "./tooltip.css";
/**
 * Tooltip component for contextual information
 *
 * @example
 * ```tsx
 * <Tooltip content="Este es un tooltip informativo" position="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * <Tooltip content="Ayuda adicional" position="right" delay={300}>
 *   <Icon name="help" />
 * </Tooltip>
 * ```
 */
export declare const Tooltip: React.FC<TooltipProps>;
