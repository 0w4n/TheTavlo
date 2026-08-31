import React from "react";
import type { ChartProps } from "./chart.types";
import "./chart.css";
/**
 * Chart component using D3.js
 *
 * @example
 * ```tsx
 * <Chart
 *   type="line"
 *   data={[
 *     { label: 'Ene', value: 30 },
 *     { label: 'Feb', value: 45 },
 *     { label: 'Mar', value: 60 }
 *   ]}
 *   title="Ventas Mensuales"
 * />
 * ```
 */
export declare const Chart: React.FC<ChartProps>;
