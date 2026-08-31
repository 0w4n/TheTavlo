import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import WidgetContainer from "#features/widgets/components/templates/base/container/WidgetContainer";
import { DEFAULT_BREAKPOINTS, DEFAULT_COLS, ResponsiveGridLayout, useContainerWidth, verticalCompactor, } from "react-grid-layout";
import { absoluteStrategy,
//calcGridCellDimensions,
 } from "react-grid-layout/core";
import "./dashboard.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useEffect, useRef, useState } from "react";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import LoadingPage from "#components/pages/LoadingPage";
import ModalPortal from "#components/molecules/modal/portal";
import AddWidget from "#components/templates/dialog/modWidget/addWidget";
function buildInitialLayouts(widgets) {
    const makeLayout = (breakPoint) => widgets.flatMap((widget) => {
        const layout = widget.layout[breakPoint];
        if (!layout) {
            throw new Error("No tiene layout");
        }
        const itemMap = [];
        const item = {
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
    const layouts = {
        lg: makeLayout("lg"),
        md: makeLayout("md"),
        sm: makeLayout("sm"),
        xs: makeLayout("xs"),
        xxs: makeLayout("xxs"),
    };
    return layouts;
}
function toggleEditMode(layouts, editMode) {
    const patch = (l) => l?.map((item) => ({
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
export function Dashboard({ widgetState }) {
    const { width, containerRef, mounted } = useContainerWidth({
        measureBeforeMount: true,
    });
    const { updateLayout, addWidget } = useWidgets();
    if (widgetState == undefined || widgetState.isLoading) {
        return _jsx(LoadingPage, {});
    }
    // TODO: Hay que poner un `calcGridCellDimensions` para hacer un overlay
    const widgetList = widgetState.widgets;
    const editMode = widgetState.editMode;
    const initalLay = buildInitialLayouts(widgetList);
    const [layouts, setLayouts] = useState(initalLay);
    const layoutsRef = useRef(layouts);
    const hasChangesRef = useRef(false);
    const prevEditModeRef = useRef(editMode);
    const handleAddWidget = async (type) => {
        return addWidget(type);
    };
    useEffect(() => {
        const next = buildInitialLayouts(widgetList);
        setLayouts(next);
        layoutsRef.current = next;
        hasChangesRef.current = false;
    }, [widgetList]);
    useEffect(() => {
        setLayouts((prev) => toggleEditMode(prev, editMode));
    }, [editMode]);
    useEffect(() => {
        if (prevEditModeRef.current && !editMode && hasChangesRef.current) {
            updateLayout(layoutsRef.current);
            hasChangesRef.current = false;
        }
        prevEditModeRef.current = editMode;
    }, [editMode]);
    console.log("widgetList length: ", widgetList.length);
    return (_jsx("div", { className: "dashboard", "data-edit-mode": editMode, ref: containerRef, children: widgetList.length > 0 ? (mounted && (_jsx(ResponsiveGridLayout, { breakpoints: DEFAULT_BREAKPOINTS, cols: DEFAULT_COLS, width: width, rowHeight: 150, layouts: layouts, containerPadding: [0, 0], margin: [10, 10], positionStrategy: absoluteStrategy, compactor: verticalCompactor, children: widgetList.map((widget) => (_jsx("div", { style: { display: "flex" }, children: _jsx(WidgetContainer, { type: widget.type, widget: widget, editMode: editMode }) }, widget.id))) }))) : (_jsxs("div", { className: "dashboard-empty", children: [_jsx("span", { children: "Dashboard vacio" }), _jsx(ModalPortal, { label: "A\u00F1adir tu primer widget", iconName: "IconPlus", children: (onClose) => (_jsx(AddWidget, { onAddWidget: handleAddWidget, onClose: onClose })) })] })) }));
}
