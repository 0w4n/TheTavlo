import React from "react";
import type { EmptyStateProps } from "./emptystate.types";
import "./emptystate.css";
/**
 * EmptyState component for displaying empty or zero states
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<GridIcon />}
 *   title="No hay widgets"
 *   description="Comienza agregando tu primer widget"
 *   action={<Button>Añadir widget</Button>}
 * />
 * ```
 */
export declare const EmptyState: React.FC<EmptyStateProps>;
