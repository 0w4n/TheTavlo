import React from "react";
import type { DashboardProps } from "./dashboard.types";
import "./dashboard.css";

/**
 * Dashboard component - Main application screen
 *
 * @example
 * ```tsx
 * // Empty dashboard
 * <Dashboard isEmpty emptyState={<EmptyState ... />} />
 *
 * // With content
 * <Dashboard>
 *   <div className="dashboar grid">
 *     <Widget />
 *     <Widget />
 *   </div>
 * </Dashboard>
 * ```
 */
export const Dashboard: React.FC<DashboardProps> = ({
  isEmpty = false,
  emptyState,
  children,
  ...props
}) => {
  const classes = isEmpty ? "empty grid" : "content grid";
  return (
    <div className={`dashboard ${classes}`} {...props}>
      {isEmpty ? emptyState : children}
    </div>
  );
};

Dashboard.displayName = "Dashboard";
