import type { HTMLAttributes } from 'react';

export type ChartType = 'line' | 'bar' | 'pie' | 'area';
export type ChartSize = 'sm' | 'md' | 'lg';

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'data'> {
  /**
   * Type of chart to render
   * @default 'line'
   */
  type?: ChartType;
  
  /**
   * Data to display
   */
  data: DataPoint[];
  
  /**
   * Size of the chart
   * @default 'md'
   */
  size?: ChartSize;
  
  /**
   * Title of the chart
   */
  title?: string;
  
  /**
   * Show grid lines
   * @default true
   */
  showGrid?: boolean;
  
  /**
   * Show labels on data points
   * @default true
   */
  showLabels?: boolean;
  
  /**
   * Primary color for the chart
   */
  color?: string;
  
  /**
   * Whether to animate on mount
   * @default true
   */
  animate?: boolean;
}