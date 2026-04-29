import type { Widget } from "#features/widgets/domain/widget.entity";
import WidgetContainer from "#components/templates/widgets/base/container/WidgetContainer";
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
  ResponsiveGridLayout,
  useContainerWidth,
  type Breakpoint,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from "react-grid-layout";
import { absoluteStrategy } from "react-grid-layout/core";
import "./dashboard.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useCallback, useEffect, useRef, useState } from "react";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";

function buildInitialLayouts(
  widgets: Widget[],
  editMode: boolean,
): ResponsiveLayouts {
  const makeLayout = (breakPoint: Breakpoint): LayoutItem[] =>
    widgets.flatMap((widget) => {
      const layout = widget.layout[breakPoint];
      console.debug("Widget con layout", layout, "y el widget: ", widget);

      if (!layout) {
        throw new Error("No tiene layout");
      }

      const itemMap = [];

      for (let index = 0; index < layout.length; index++) {
        const element = layout[index];

        console.log("id del widget: ", widget.id, "index: ", index);

        const item: LayoutItem = {
          i:`${widget.id}-${index}`,
          h: element.h,
          w: element.w,
          x: element.x,
          y: element.y,
          isDraggable: widget.locked,
          isResizable: widget.locked,
          resizeHandles: ["se"],
        };

        console.info("Item generado: ", item);

        itemMap.push(item);
      }

      return itemMap;
    });

  console.info(
    "Building initial layouts for widgets:",
    widgets.map((w) => w),
    "with editMode:",
    editMode,
    ", resulting in layouts:",
    DEFAULT_COLS,
    DEFAULT_BREAKPOINTS,
  );

  return {
    lg: makeLayout("lg"),
    md: makeLayout("md"),
    sm: makeLayout("sm"),
    xs: makeLayout("xs"),
    xxs: makeLayout("xxs"),
  };
}

function toggleEditMode(
  layouts: ResponsiveLayouts,
  editMode: boolean,
): ResponsiveLayouts {
  const patch = (l?: Layout) =>
    l?.map((item) => ({
      ...item,
      isDraggable: editMode,
      isResizable: editMode,
    }));

  return {
    lg: patch(layouts.lg),
    md: patch(layouts.md),
    sm: patch(layouts.sm),
    xs: patch(layouts.xs),
    xxs: patch(layouts.xxs),
  };
}

type Props = {
  widgetList: Widget[];
  editMode: boolean;
};

export function Dashboard({ widgetList, editMode }: Props) {
  const { width, containerRef, mounted } = useContainerWidth();
  const { updateLayout } = useWidgets();

  const [layouts, setLayouts] = useState<ResponsiveLayouts>(
    buildInitialLayouts(widgetList, editMode),
  );

  console.log("Dashboard render with layouts:", layouts, "and width:", width);

  const layoutsRef = useRef<ResponsiveLayouts>(layouts);
  const hasChangesRef = useRef(false);
  const prevEditModeRef = useRef(editMode);

  /** 🧠 Sync inicial cuando cambian widgets */
  useEffect(() => {
    const next = buildInitialLayouts(widgetList, editMode);
    setLayouts(next);
    console.log("Dashboard render with layouts:", layouts, "and width:", width);
    layoutsRef.current = next;
    hasChangesRef.current = false;
  }, [widgetList]);

  /** ✏️ Toggle edición */
  useEffect(() => {
    setLayouts((prev) => toggleEditMode(prev, editMode));
  }, [editMode]);

  /** 🔁 Captura cambios SIN setState */
  const handleLayoutChange = useCallback(
    (_: Layout, all: ResponsiveLayouts) => {
      layoutsRef.current = all;
      hasChangesRef.current = true;
      setLayouts(all);
    },
    [],
  );

  /** 💾 Guardar SOLO al salir de editMode */
  useEffect(() => {
    if (prevEditModeRef.current && !editMode && hasChangesRef.current) {
      console.log("Dashboard - Saving layouts:", layoutsRef.current);
      updateLayout(layoutsRef.current);
      hasChangesRef.current = false;
    }
    prevEditModeRef.current = editMode;
  }, [editMode]);

  return (
    <div className="dashboard" data-edit-mode={editMode} ref={containerRef}>
      {mounted && (
        <ResponsiveGridLayout
          breakpoints={DEFAULT_BREAKPOINTS}
          cols={DEFAULT_COLS}
          width={width}
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          containerPadding={[0, 0]}
          margin={[10, 10]}
          positionStrategy={absoluteStrategy}
        >
          {widgetList.map((widget, index) => (
            <div key={`${widget.id}-${index}`} style={{ display: "flex" }}>
              <WidgetContainer widget={widget} editMode={editMode} />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
