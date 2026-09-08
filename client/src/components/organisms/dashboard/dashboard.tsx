import type {
  Widget,
  WidgetType,
} from "#features/widgets/domain/widget.entity";
import WidgetContainer from "#features/widgets/components/templates/base/container/WidgetContainer";
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
import WidgetErrorBoundary from "#features/widgets/components/templates/base/container/WidgetErrorBoundary";

function buildInitialLayouts(
  widgets: Widget[]
): ResponsiveLayouts {
  const makeLayout = (breakPoint: Breakpoint): LayoutItem[] =>
    widgets.flatMap((widget) => {
      const layout = widget.layout[breakPoint] ?? widget.layout.lg;

      if (!layout) {
        return [];
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

      itemMap.push(item);

      return itemMap;
    });

  const layouts: ResponsiveLayouts = {
    lg: makeLayout("lg"),
    md: makeLayout("md"),
    sm: makeLayout("sm"),
    xs: makeLayout("xs"),
    xxs: makeLayout("xxs"),
  };

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

const EMPTY_WIDGETS: Widget[] = [];

export function Dashboard({ widgetState }: Props) {
  const { width, containerRef, mounted } = useContainerWidth();
  const { updateLayout, addWidget } = useWidgets();

  const isLoading = widgetState?.isLoading ?? true;
  const widgetList = isLoading ? EMPTY_WIDGETS : widgetState.widgets;
  const editMode = isLoading ? false : widgetState.editMode;

  // TODO: Hay que poner un `calcGridCellDimensions` para hacer un overlay

  const initialLayouts = buildInitialLayouts(widgetList);

  const [layouts, setLayouts] = useState<ResponsiveLayouts>(initialLayouts);

  const layoutsRef = useRef<ResponsiveLayouts>(layouts);
  const hasChangesRef = useRef(false);
  const prevEditModeRef = useRef(editMode);
  const isApplyingEditModeRef = useRef(false);

  const handleAddWidget = async (type: WidgetType) => {
    return addWidget(type);
  };

  useEffect(() => {
    const next = buildInitialLayouts(widgetList);
    setLayouts(next);
    layoutsRef.current = next;
    hasChangesRef.current = false;
  }, [widgetList]);

  useEffect(() => {
    isApplyingEditModeRef.current = true;
    setLayouts((prev) => toggleEditMode(prev, editMode));
    requestAnimationFrame(() => {
      isApplyingEditModeRef.current = false;
    });
  }, [editMode]);

  useEffect(() => {
    if (prevEditModeRef.current && !editMode && hasChangesRef.current) {
      updateLayout(layoutsRef.current);
      hasChangesRef.current = false;
    }
    prevEditModeRef.current = editMode;
  }, [editMode]);

  const hasLayouts =
    widgetList.length === 0 || layouts.lg?.length === widgetList.length;

  if (isLoading) {
    return <LoadingPage />;
  }

  console.log("widgetList length: ", widgetList.length);
  
  return (
    <div className="dashboard" data-edit-mode={editMode} ref={containerRef}>
      {widgetList.length > 0 ? (
        mounted && hasLayouts && (
          <ResponsiveGridLayout
            breakpoints={DEFAULT_BREAKPOINTS}
            cols={DEFAULT_COLS}
            width={width}
            rowHeight={150}
            layouts={layouts}
            onLayoutChange={(_currentLayout, allLayouts) => {
              if (!editMode || isApplyingEditModeRef.current) return;
              setLayouts(allLayouts);
              layoutsRef.current = allLayouts;
              hasChangesRef.current = true;
            }}
            containerPadding={[0, 0]}
            margin={[10, 10]}
            positionStrategy={absoluteStrategy}
            compactor={verticalCompactor}
          >
            {widgetList.map((widget) => (
              <div
                key={widget.id}
                style={{ display: "flex", width: "100%", height: "100%", minWidth: 0, minHeight: 0 }}
              >
                  <WidgetErrorBoundary>
                    <WidgetContainer type={widget.type} widget={widget} editMode={editMode} />
                  </WidgetErrorBoundary>
              </div>
            ))}
          </ResponsiveGridLayout>
        )
      ) : (
        <div className="dashboard-empty">
          <span>Dashboard vacio</span>
          <ModalPortal label="Añadir tu primer widget" iconName="IconPlus">
            {(onClose: () => void) => (
              <AddWidget
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
