import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

import useTasks from "#features/task/presentation/hooks/useTask";
import useTheme from "#shared/themes/presentation/hooks/useTheme";

interface ProductivityChartWidgetProps {
  panelId: string;
  config: {
    chartType?: "bar" | "line" | "area";
    period?: "week" | "month";
    showGrid?: boolean;
  };
}

export function ProductivityChartWidget({
  panelId,
  config,
}: ProductivityChartWidgetProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state: tasksState } = useTasks();
  const { colors } = useTheme();

  const chartData = useMemo(() => {
    const panelTasks = tasksState.tasks.filter((t) => t.id === panelId);
    const now = new Date();
    const daysAgo = config.period === "week" ? 7 : 30;

    const dates: Date[] = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }

    const data = dates.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const completed = panelTasks.filter(
        (task) =>
          task.status && task.updatedAt.toDate() >= date && task.updatedAt.toDate() < nextDay
      ).length;

      const created = panelTasks.filter(
        (task) => task.createdAt.toDate() >= date && task.createdAt.toDate() < nextDay
      ).length;

      return {
        date,
        completed,
        created,
        label: date.toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        }),
      };
    });

    return data;
  }, [tasksState.tasks, panelId, config.period]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.label))
      .range([0, width])
      .padding(0.2);

    const maxValue =
      d3.max(chartData, (d) => Math.max(d.completed, d.created)) || 1;

    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height, 0])
      .nice();

    // Grid lines
    if (config.showGrid !== false) {
      svg
        .append("g")
        .attr("class", "grid")
        .selectAll("line")
        .data(y.ticks(5))
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", (d) => y(d))
        .attr("y2", (d) => y(d))
        .attr("stroke", "var(--color-border)")
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0.5);
    }

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "var(--color-surface)")
      .style("border", "1px solid var(--color-border)")
      .style("border-radius", "var(--border-radius)")
      .style("padding", "0.5rem")
      .style("font-size", "0.8rem")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 4px 12px var(--color-shadow)")
      .style("z-index", 10000);

    if (config.chartType === "line" || config.chartType === "area") {
      // Line chart
      const lineCompleted = d3
        .line<(typeof chartData)[0]>()
        .x((d, _i) => (x(d.label) || 0) + x.bandwidth() / 2)
        .y((d) => y(d.completed))
        .curve(d3.curveMonotoneX);

      const lineCreated = d3
        .line<(typeof chartData)[0]>()
        .x((d, _i) => (x(d.label) || 0) + x.bandwidth() / 2)
        .y((d) => y(d.created))
        .curve(d3.curveMonotoneX);

      // Area
      if (config.chartType === "area") {
        const areaCompleted = d3
          .area<(typeof chartData)[0]>()
          .x((d, _i) => (x(d.label) || 0) + x.bandwidth() / 2)
          .y0(height)
          .y1((d) => y(d.completed))
          .curve(d3.curveMonotoneX);

        svg
          .append("path")
          .datum(chartData)
          .attr("fill", colors.success)
          .attr("fill-opacity", 0.2)
          .attr("d", areaCompleted);

        const areaCreated = d3
          .area<(typeof chartData)[0]>()
          .x((d, _i) => (x(d.label) || 0) + x.bandwidth() / 2)
          .y0(height)
          .y1((d) => y(d.created))
          .curve(d3.curveMonotoneX);

        svg
          .append("path")
          .datum(chartData)
          .attr("fill", colors.info)
          .attr("fill-opacity", 0.2)
          .attr("d", areaCreated);
      }

      // Lines
      svg
        .append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", colors.success)
        .attr("stroke-width", 3)
        .attr("d", lineCompleted);

      svg
        .append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", colors.info)
        .attr("stroke-width", 3)
        .attr("d", lineCreated);

      // Points
      svg
        .selectAll(".point-completed")
        .data(chartData)
        .enter()
        .append("circle")
        .attr("class", "point-completed")
        .attr("cx", (d, _i) => (x(d.label) || 0) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.completed))
        .attr("r", 4)
        .attr("fill", colors.success)
        .attr("stroke", "var(--color-surface)")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("r", 6);
          tooltip
            .style("opacity", 1)
            .html(
              `
              <div style="color: var(--color-textPrimary)">
                <strong>${d.label}</strong><br/>
                <span style="color: ${colors.success}">● Completadas: ${d.completed}</span>
              </div>
            `
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 4);
          tooltip.style("opacity", 0);
        });

      svg
        .selectAll(".point-created")
        .data(chartData)
        .enter()
        .append("circle")
        .attr("class", "point-created")
        .attr("cx", (d, _i) => (x(d.label) || 0) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.created))
        .attr("r", 4)
        .attr("fill", colors.info)
        .attr("stroke", "var(--color-surface)")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("r", 6);
          tooltip
            .style("opacity", 1)
            .html(
              `
              <div style="color: var(--color-textPrimary)">
                <strong>${d.label}</strong><br/>
                <span style="color: ${colors.info}">● Creadas: ${d.created}</span>
              </div>
            `
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 4);
          tooltip.style("opacity", 0);
        });
    } else {
      // Bar chart
      const barWidth = x.bandwidth() / 2 - 2;

      // Bars for completed
      svg
        .selectAll(".bar-completed")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar-completed")
        .attr("x", (d) => x(d.label) || 0)
        .attr("y", height)
        .attr("width", barWidth)
        .attr("height", 0)
        .attr("fill", colors.success)
        .attr("rx", 4)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("opacity", 0.8);
          tooltip
            .style("opacity", 1)
            .html(
              `
              <div style="color: var(--color-textPrimary)">
                <strong>${d.label}</strong><br/>
                <span style="color: ${colors.success}">● Completadas: ${d.completed}</span>
              </div>
            `
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.style("opacity", 0);
        })
        .transition()
        .duration(800)
        .delay((_d, i) => i * 50)
        .attr("y", (d) => y(d.completed))
        .attr("height", (d) => height - y(d.completed));

      // Bars for created
      svg
        .selectAll(".bar-created")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar-created")
        .attr("x", (d) => (x(d.label) || 0) + barWidth + 2)
        .attr("y", height)
        .attr("width", barWidth)
        .attr("height", 0)
        .attr("fill", colors.info)
        .attr("rx", 4)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("opacity", 0.8);
          tooltip
            .style("opacity", 1)
            .html(
              `
              <div style="color: var(--color-textPrimary)">
                <strong>${d.label}</strong><br/>
                <span style="color: ${colors.info}">● Creadas: ${d.created}</span>
              </div>
            `
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("opacity", 1);
          tooltip.style("opacity", 0);
        })
        .transition()
        .duration(800)
        .delay((_d, i) => i * 50)
        .attr("y", (d) => y(d.created))
        .attr("height", (d) => height - y(d.created));
    }

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "0.75rem")
      .style("fill", "var(--color-textSecondary)");

    // Y Axis
    svg
      .append("g")
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .style("font-size", "0.75rem")
      .style("fill", "var(--color-textSecondary)");

    // Axis styling
    svg.selectAll(".domain, .tick line").attr("stroke", "var(--color-border)");

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [chartData, colors, config.chartType, config.showGrid]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "var(--color-textPrimary)",
          }}
        >
          Productividad - {config.period === "week" ? "7 días" : "30 días"}
        </div>
        <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                background: colors.success,
                borderRadius: "2px",
              }}
            />
            <span style={{ color: "var(--color-textSecondary)" }}>
              Completadas
            </span>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                background: colors.info,
                borderRadius: "2px",
              }}
            />
            <span style={{ color: "var(--color-textSecondary)" }}>Creadas</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <svg ref={svgRef} style={{ width: "100%", overflow: "visible" }} />
    </div>
  );
}
