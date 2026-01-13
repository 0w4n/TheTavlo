import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

import useTasks from "#features/task/presentation/hooks/useTask";
import useTheme from "#shared/themes/presentation/hooks/useTheme";

export function DonutChartWidget({ panelId }: { panelId: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state: tasksState } = useTasks();
  const { colors } = useTheme();

  const stats = useMemo(() => {
    const panelTasks = tasksState.tasks.filter((t) => t.id === panelId);

    return [
      {
        label: "Completadas",
        value: panelTasks.filter((t) => t.status).length,
        color: colors.success,
      },
      {
        label: "Pendientes",
        value: panelTasks.filter((t) => !t.status && t.dueDate.toDate() > new Date())
          .length,
        color: colors.info,
      },
      {
        label: "Vencidas",
        value: panelTasks.filter((t) => !t.status && t.dueDate.toDate() < new Date())
          .length,
        color: colors.error,
      },
    ].filter((d) => d.value > 0);
  }, [tasksState.tasks, panelId, colors]);

  useEffect(() => {
    if (!svgRef.current || stats.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<(typeof stats)[0]>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<(typeof stats)[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcHover = d3
      .arc<d3.PieArcDatum<(typeof stats)[0]>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 10);

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

    // Create arcs
    const arcs = svg
      .selectAll(".arc")
      .data(pie(stats))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "var(--color-surface)")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", (d: any) => arcHover(d)!);

        const percentage = (
          (d.value / d3.sum(stats, (d) => d.value)) *
          100
        ).toFixed(1);
        tooltip
          .style("opacity", 1)
          .html(
            `
            <div style="color: var(--color-textPrimary)">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 12px; height: 12px; background: ${d.data.color}; border-radius: 2px;"></div>
                <strong>${d.data.label}</strong>
              </div>
              <div style="margin-top: 0.25rem;">
                ${d.data.value} tareas (${percentage}%)
              </div>
            </div>
          `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", (d: any) => arc(d)!);
        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || "";
        };
      });

    // Center text
    const total = d3.sum(stats, (d) => d.value);
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "2rem")
      .style("font-weight", "bold")
      .style("fill", "var(--color-textPrimary)")
      .text(total);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .style("font-size", "0.9rem")
      .style("fill", "var(--color-textSecondary)")
      .text("tareas");

    return () => {
      tooltip.remove();
    };
  }, [stats]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg ref={svgRef} />

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
          marginTop: "1rem",
        }}
      >
        {stats.map((stat, index) => {
          const total = stats.reduce((sum, s) => sum + s.value, 0);
          const percentage = ((stat.value / total) * 100).toFixed(1);

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem",
                background: "var(--color-backgroundSecondary)",
                borderRadius: "var(--border-radius)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    background: stat.color,
                    borderRadius: "2px",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-textPrimary)",
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    color: "var(--color-textPrimary)",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-textSecondary)",
                  }}
                >
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
