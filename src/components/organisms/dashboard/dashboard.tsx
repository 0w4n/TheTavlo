import type {
  Widget,
  WidgetType,
} from "#features/widgets/domain/widget.entity";
import WidgetContainer from "#components/templates/widgets/base/container/WidgetContainer";
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
  type Breakpoint,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from "react-grid-layout";
import {
  absoluteStrategy,
  //calcGridCellDimensions,
} from "react-grid-layout/core";
import "./dashboard.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useEffect, useRef, useState } from "react";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import type { WidgetsState } from "#features/widgets/presentation/context/widgetReducer";
import LoadingPage from "#components/pages/LoadingPage";
import ModalPortal from "#components/molecules/modal/portal";
import AddWidget from "#components/templates/dialog/modWidget/addWidget";

function buildInitialLayouts(
  widgets: Widget[],
  editMode: boolean,
): ResponsiveLayouts {
  const makeLayout = (breakPoint: Breakpoint): LayoutItem[] =>
    widgets.flatMap((widget) => {
      const layout = widget.layout[breakPoint];
      console.debug("Widget con layout", layout, ", el widget: ", widget);

      if (!layout) {
        throw new Error("No tiene layout");
      }

      const itemMap = [];

      const item: LayoutItem = {
        i: widget.id,
        x: layout.x,
        y: layout.y,
        h: layout.h,
        w: layout.w,
        isDraggable: widget.locked,
        isResizable: widget.locked,
        resizeHandles: ["se"],
      };

      console.info("Item generado: ", item);

      itemMap.push(item);

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

  const layouts: ResponsiveLayouts = {
    lg: makeLayout("lg"),
    md: makeLayout("md"),
    sm: makeLayout("sm"),
    xs: makeLayout("xs"),
    xxs: makeLayout("xxs"),
  };

  console.log("Resultados: ", layouts);

  return layouts;
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
  widgetState: WidgetsState;
};

export function Dashboard({ widgetState }: Props) {
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });
  const { updateLayout, addWidget } = useWidgets();

  console.log("widgetState: ", widgetState);
  if (widgetState == undefined || widgetState.isLoading) {
    <LoadingPage />;
  }

  // TODO: Hay que poner un `calcGridCellDimensions` para hacer un overlay

  const widgetList = widgetState.widgets;
  const editMode = widgetState.editMode;
  const initalLay = buildInitialLayouts(widgetList, editMode);

  console.log("Initial:", initalLay);

  const [layouts, setLayouts] = useState<ResponsiveLayouts>(initalLay);

  console.log("Dashboard render with layouts:", layouts, "and width:", width);

  const layoutsRef = useRef<ResponsiveLayouts>(layouts);
  const hasChangesRef = useRef(false);
  const prevEditModeRef = useRef(editMode);

  const handleAddWidget = async (type: WidgetType) => {
    return addWidget(type);
  };

  /** 🧠 Sync inicial cuando cambian widgets */
  useEffect(() => {
    const next = buildInitialLayouts(widgetList, editMode);
    setLayouts(next);
    console.log(
      "Dashboard on the `useEffect` inicial sync render with layouts:",
      layouts,
      "and width:",
      width,
    );
    layoutsRef.current = next;
    hasChangesRef.current = false;
  }, [widgetList]);

  /** ✏️ Toggle edición */
  useEffect(() => {
    console.log("[useEffect]: Toggle edit");
    setLayouts((prev) => toggleEditMode(prev, editMode));
  }, [editMode]);

  /** 🔁 Captura cambios SIN setState */
  // const handleLayoutChange = useCallback(
  //   (_: Layout, all: ResponsiveLayouts) => {
  //     layoutsRef.current = all;
  //     hasChangesRef.current = true;
  //     setLayouts(all);
  //     console.log("Layout: ", _, "all: ", all);
  //   },
  //   [],
  // );

  /** 💾 Guardar SOLO al salir de editMode */
  useEffect(() => {
    if (prevEditModeRef.current && !editMode && hasChangesRef.current) {
      console.log("Dashboard - Saving layouts:", layoutsRef.current);
      updateLayout(layoutsRef.current);
      hasChangesRef.current = false;
    }
    prevEditModeRef.current = editMode;
  }, [editMode]);

  console.log("Mounted: ", mounted, "containerRef: ", containerRef);

  return (
    <div className="dashboard" data-edit-mode={editMode} ref={containerRef}>
      {widgetList.length > 0 ? (
        mounted && (
          <ResponsiveGridLayout
            breakpoints={DEFAULT_BREAKPOINTS}
            cols={DEFAULT_COLS}
            width={width}
            layouts={layouts}
            containerPadding={[0, 0]}
            margin={[10, 10]}
            positionStrategy={absoluteStrategy}
            compactor={verticalCompactor}
          >
            {widgetList.map((widget) => (
              <div key={widget.id} style={{ display: "flex" }}>
                <WidgetContainer type={widget.type} widget={widget} editMode={editMode} />
              </div>
            ))}
          </ResponsiveGridLayout>
        )
      ) : (
        <div>
          <span>Panel vacio</span>
          <ModalPortal label="Añadir tu próximo panel" iconName="IconPlus">
            {(onClose: () => void) => (
              <AddWidget
                isHome={true}
                onAddWidget={handleAddWidget}
                onClose={onClose}
              />
            )}
          </ModalPortal>
        </div>
      )}
    </div>
  );
}
