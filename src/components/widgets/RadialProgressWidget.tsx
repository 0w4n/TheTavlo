import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

import useTasks from "#features/task/presentation/hooks/useTask";
// import useExams from "#features/exams/presentation/hooks/useExams";

import useTheme from "#shared/themes/presentation/hooks/useTheme";

export function RadialProgressWidget({ panelId }: { panelId: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state: tasksState } = useTasks();
  // const { state: examsState } = useExams();
  const { colors } = useTheme();

  const goals = useMemo(() => {
    const panelTasks = tasksState.tasks.filter((t) => t.id === panelId);
    // const panelExams = examsState.exams.filter((e: { panelId: string; }) => e.panelId === panelId);

    const totalTasks = panelTasks.length;
    const completedTasks = panelTasks.filter((t) => t.status).length;

    // const totalExams = panelExams.length;
    // const completedExams = panelExams.filter(
    //   (e: { status: string; }) => e.status === "graded"
    // ).length;

    const highPriorityTasks = panelTasks.filter(
      (t) => t.priority === "high"
    ).length;
    const completedHighPriority = panelTasks.filter(
      (t) => t.priority === "high" && t.status
    ).length;

    return [
      {
        label: "Tareas",
        value: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        color: colors.success,
        count: `${completedTasks}/${totalTasks}`,
      },
      // {
      //   label: "Exámenes",
      //   value: totalExams > 0 ? (completedExams / totalExams) * 100 : 0,
      //   color: colors.info,
      //   count: `${completedExams}/${totalExams}`,
      // },
      {
        label: "Alta Prioridad",
        value:
          highPriorityTasks > 0
            ? (completedHighPriority / highPriorityTasks) * 100
            : 0,
        color: colors.warning,
        count: `${completedHighPriority}/${highPriorityTasks}`,
      },
    ];
  }, [tasksState.tasks, , panelId, colors]); // examsState.exams

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = 300;
    const height = goals.length * 100;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    goals.forEach((goal, index) => {
      const g = svg
        .append("g")
        .attr("transform", `translate(50, ${index * 100 + 50})`);

      const radius = 35;
      const circumference = 2 * Math.PI * radius;

      // Background circle
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "var(--color-backgroundTertiary)")
        .attr("stroke-width", 6);

      // Progress circle
      const progress = g
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", goal.color)
        .attr("stroke-width", 6)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", circumference)
        .attr("stroke-dashoffset", circumference)
        .attr("transform", "rotate(-90)");

      // Animate progress
      progress
        .transition()
        .duration(1500)
        .delay(index * 200)
        .ease(d3.easeCubicOut)
        .attr(
          "stroke-dashoffset",
          circumference - (goal.value / 100) * circumference
        );

      // Center text
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .style("font-size", "1.2rem")
        .style("font-weight", "bold")
        .style("fill", "var(--color-textPrimary)")
        .text("0%")
        .transition()
        .duration(1500)
        .delay(index * 200)
        .tween("text", function () {
          const interpolate = d3.interpolateNumber(0, goal.value);
          return function (t) {
            d3.select(this).text(`${Math.round(interpolate(t))}%`);
          };
        });

      // Label
      g.append("text")
        .attr("x", radius + 15)
        .attr("y", -5)
        .style("font-size", "0.95rem")
        .style("font-weight", "600")
        .style("fill", "var(--color-textPrimary)")
        .text(goal.label);

      // Count
      g.append("text")
        .attr("x", radius + 15)
        .attr("y", 15)
        .style("font-size", "0.8rem")
        .style("fill", "var(--color-textSecondary)")
        .text(`${goal.count} completadas`);
    });
  }, [goals]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <svg ref={svgRef} style={{ width: "100%" }} />
    </div>
  );
}
