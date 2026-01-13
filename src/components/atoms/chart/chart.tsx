import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
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

export const Chart: React.FC<ChartProps> = ({
  type = "line",
  data,
  size = "md",
  title,
  showGrid = true,
  showLabels = true,
  color = "#6b7df6",
  animate = true,
  className = "",
  ...props
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const container = containerRef.current;
    if (!container) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = container.offsetWidth - margin.left - margin.right;
    const height = container.offsetHeight - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    switch (type) {
      case "line":
        renderLineChart(
          svg,
          data,
          width,
          height,
          color,
          showGrid,
          showLabels,
          animate
        );
        break;
      case "bar":
        renderBarChart(
          svg,
          data,
          width,
          height,
          color,
          showGrid,
          showLabels,
          animate
        );
        break;
      case "pie":
        renderPieChart(svg, data, width, height, showLabels, animate);
        break;
      case "area":
        renderAreaChart(
          svg,
          data,
          width,
          height,
          color,
          showGrid,
          showLabels,
          // animate
        );
        break;
    }
  }, [data, type, size, color, showGrid, showLabels, animate]);

  const classes = ["chart", `chart--${size}`, className]
    .filter(Boolean)
    .join(" ");

  if (!data || data.length === 0) {
    return (
      <div className={classes} {...props}>
        {title && <h3 className="chart__title">{title}</h3>}
        <div className="chart__no-data">
          <svg
            className="chart__no-data-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M3 3v18h18"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 17l-5-5-4 4-4-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>No hay datos disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <div className={classes} {...props}>
      {title && <h3 className="chart__title">{title}</h3>}
      <div ref={containerRef} className="chart__svg-container">
        <svg ref={svgRef} className="chart__svg" />
      </div>
    </div>
  );
};

// Line Chart
function renderLineChart(
  svg: any,
  data: any[],
  width: number,
  height: number,
  color: string,
  showGrid: boolean,
  showLabels: boolean,
  animate: boolean
) {
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) || 100])
    .nice()
    .range([height, 0]);

  // Grid
  if (showGrid) {
    svg
      .append("g")
      .attr("class", "chart__grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      );
  }

  // Axes
  svg
    .append("g")
    .attr("class", "chart__axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").attr("class", "chart__axis").call(d3.axisLeft(y));

  // // Line
  // const line = d3
  //   .line()
  //   .x((d: any) => (x(d.label) || 0) + x.bandwidth() / 2)
  //   .y((d: any) => y(d.value))
  //   .curve(d3.curveMonotoneX);

  // const path = svg
  //   .append("path")
  //   .datum(data)
  //   .attr(
  //     "class",
  //     animate ? "chart__line chart__line--animated" : "chart__line"
  //   )
  //   .attr("d", line)
  //   .attr("stroke", color);

  // Points
  svg
    .selectAll(".chart__line-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "chart__line-point")
    .attr("cx", (d: any) => (x(d.label) || 0) + x.bandwidth() / 2)
    .attr("cy", (d: any) => y(d.value))
    .attr("r", 4)
    .attr("stroke", color)
    .attr("opacity", animate ? 0 : 1)
    .transition()
    .delay((_d: any, i: number) => i * 100)
    .duration(500)
    .attr("opacity", 1);

  // Labels
  if (showLabels) {
    svg
      .selectAll(".chart__value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "chart__value-label")
      .attr("x", (d: any) => (x(d.label) || 0) + x.bandwidth() / 2)
      .attr("y", (d: any) => y(d.value) - 10)
      .attr("text-anchor", "middle")
      .text((d: any) => d.value);
  }
}

// Bar Chart
function renderBarChart(
  svg: any,
  data: any[],
  width: number,
  height: number,
  color: string,
  showGrid: boolean,
  showLabels: boolean,
  animate: boolean
) {
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) || 100])
    .nice()
    .range([height, 0]);

  if (showGrid) {
    svg
      .append("g")
      .attr("class", "chart__grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      );
  }

  svg
    .append("g")
    .attr("class", "chart__axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").attr("class", "chart__axis").call(d3.axisLeft(y));

  svg
    .selectAll(".chart__bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", animate ? "chart__bar chart__bar--animated" : "chart__bar")
    .attr("x", (d: any) => x(d.label) || 0)
    .attr("y", (d: any) => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", (d: any) => height - y(d.value))
    .attr("fill", (d: any) => d.color || color);

  if (showLabels) {
    svg
      .selectAll(".chart__value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "chart__value-label")
      .attr("x", (d: any) => (x(d.label) || 0) + x.bandwidth() / 2)
      .attr("y", (d: any) => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .text((d: any) => d.value);
  }
}

// Pie Chart
function renderPieChart(
  svg: any,
  data: any[],
  width: number,
  height: number,
  showLabels: boolean,
  animate: boolean
) {
  const radius = Math.min(width, height) / 2;

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const pie = d3.pie().value((d: any) => d.value);
  const arc: any = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius - 10)
    .cornerRadius(10);
  const labelArc: any = d3
    .arc()
    .innerRadius(radius - 40)
    .outerRadius(radius - 40);

  const arcs = g
    .selectAll(".chart__pie-slice")
    .data(pie(data as any))
    .enter()
    .append("g");

  arcs
    .append("path")
    .attr(
      "class",
      animate
        ? "chart__pie-slice chart__pie-slice--animated"
        : "chart__pie-slice"
    )
    .attr("d", arc)
    .attr(
      "fill",
      (d: any, i: number) => d.data.color || d3.schemeCategory10[i]
    );

  if (showLabels) {
    arcs
      .append("text")
      .attr("class", "chart__label")
      .attr("transform", (d: any) => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.label);
  }
}

// Area Chart
function renderAreaChart(
  svg: any,
  data: any[],
  width: number,
  height: number,
  color: string,
  showGrid: boolean,
  // showLabels: boolean,
  animate: boolean
) {
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) || 100])
    .nice()
    .range([height, 0]);

  if (showGrid) {
    svg
      .append("g")
      .attr("class", "chart__grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      );
  }

  svg
    .append("g")
    .attr("class", "chart__axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").attr("class", "chart__axis").call(d3.axisLeft(y));

  const area = d3
    .area()
    .x((d: any) => (x(d.label) || 0) + x.bandwidth() / 2)
    .y0(height)
    .y1((d: any) => y(d.value))
    .curve(d3.curveMonotoneX);

  svg
    .append("path")
    .datum(data)
    .attr("class", "chart__line")
    .attr("d", area)
    .attr("fill", color)
    .attr("opacity", 0.3);

  const line = d3
    .line()
    .x((d: any) => (x(d.label) || 0) + x.bandwidth() / 2)
    .y((d: any) => y(d.value))
    .curve(d3.curveMonotoneX);

  svg
    .append("path")
    .datum(data)
    .attr(
      "class",
      animate ? "chart__line chart__line--animated" : "chart__line"
    )
    .attr("d", line)
    .attr("stroke", color)
    .attr("fill", "none");
}

Chart.displayName = "Chart";
