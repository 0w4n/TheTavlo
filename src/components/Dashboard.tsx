import type { Widget } from "../features/widgets/domain/widget.entity";
import { WidgetRules } from "../features/widgets/domain/widget.rules";
import { useState, useRef, useEffect } from "react";
import WidgetContainer from "./WidgetContainer";

interface DashboardGridProps {
  widgets: Widget[];
  editMode: boolean;
  onLayoutChange: (widgets: Widget[]) => void;
  onWidgetRemove: (widgetId: string) => void;
  onWidgetConfig: (widgetId: string) => void;
}

export default function DashboardGrid({
  widgets,
  editMode,
  onLayoutChange,
  onWidgetRemove,
  onWidgetConfig,
}: DashboardGridProps) {
  const [draggingWidget, setDraggingWidget] = useState<Widget | null>(null);
  const [resizingWidget, setResizingWidget] = useState<Widget | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const COLUMNS = WidgetRules.GRID_COLUMNS;
  const ROW_HEIGHT = WidgetRules.ROW_HEIGHT;
  const GAP = WidgetRules.GRID_GAP;

  const handleDragStart = (widget: Widget, e: React.MouseEvent) => {
    if (!editMode || widget.locked) return;

    e.preventDefault();
    setDraggingWidget(widget);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!draggingWidget || !dragStartPos || !gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const columnWidth = (gridRect.width - GAP * (COLUMNS - 1)) / COLUMNS;

    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;

    const columnsMove = Math.round(deltaX / (columnWidth + GAP));
    const rowsMove = Math.round(deltaY / (ROW_HEIGHT + GAP));

    const newX = Math.max(
      0,
      Math.min(
        COLUMNS - draggingWidget.layout.w,
        draggingWidget.layout.x + columnsMove
      )
    );
    const newY = Math.max(0, draggingWidget.layout.y + rowsMove);

    const updatedWidgets = widgets.map((w) =>
      w.id === draggingWidget.id
        ? { ...w, layout: { ...w.layout, x: newX, y: newY } }
        : w
    );

    onLayoutChange(updatedWidgets);
  };

  const handleDragEnd = () => {
    setDraggingWidget(null);
    setDragStartPos(null);
  };

  const handleResizeStart = (widget: Widget, e: React.MouseEvent) => {
    if (!editMode || widget.locked) return;

    e.preventDefault();
    e.stopPropagation();
    setResizingWidget(widget);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingWidget || !dragStartPos || !gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const columnWidth = (gridRect.width - GAP * (COLUMNS - 1)) / COLUMNS;

    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;

    const columnsResize = Math.round(deltaX / (columnWidth + GAP));
    const rowsResize = Math.round(deltaY / (ROW_HEIGHT + GAP));

    const newW = Math.max(
      resizingWidget.layout.minW || 2,
      Math.min(
        resizingWidget.layout.maxW || COLUMNS,
        COLUMNS - resizingWidget.layout.x,
        resizingWidget.layout.w + columnsResize
      )
    );

    const newH = Math.max(
      resizingWidget.layout.minH || 2,
      Math.min(
        resizingWidget.layout.maxH || 20,
        resizingWidget.layout.h + rowsResize
      )
    );

    const updatedWidgets = widgets.map((w) =>
      w.id === resizingWidget.id
        ? { ...w, layout: { ...w.layout, w: newW, h: newH } }
        : w
    );

    onLayoutChange(updatedWidgets);
  };

  const handleResizeEnd = () => {
    setResizingWidget(null);
    setDragStartPos(null);
  };

  useEffect(() => {
    if (draggingWidget) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      return () => {
        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [draggingWidget, dragStartPos]);

  useEffect(() => {
    if (resizingWidget) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizingWidget, dragStartPos]);

  return (
    <div
      ref={gridRef}
      className="Dashboard"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        height: "100%",
        width: "100%",
        gap: `8px`,
      }}
    >
      {widgets.map((widget) => {
        const columnWidth = gridRef.current
          ? (gridRef.current.clientWidth - GAP * (COLUMNS - 1)) / COLUMNS
          : 100;

        const left = widget.layout.x * (columnWidth + GAP);
        const top = widget.layout.y * (ROW_HEIGHT + GAP);
        const width =
          widget.layout.w * columnWidth + (widget.layout.w - 1) * GAP;
        const height =
          widget.layout.h * ROW_HEIGHT + (widget.layout.h - 1) * GAP;

        return (
          <div
            key={widget.id}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              transition:
                draggingWidget?.id === widget.id ||
                resizingWidget?.id === widget.id
                  ? "none"
                  : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: editMode && !widget.locked ? "move" : "default",
              zIndex:
                draggingWidget?.id === widget.id ||
                resizingWidget?.id === widget.id
                  ? 1000
                  : 1,
            }}
          >
            <WidgetContainer
              widget={widget}
              editMode={editMode}
              onDragStart={(e) => handleDragStart(widget, e)}
              onResizeStart={(e) => handleResizeStart(widget, e)}
              onRemove={() => onWidgetRemove(widget.id)}
              onConfig={() => onWidgetConfig(widget.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
