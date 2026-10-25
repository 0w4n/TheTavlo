import {
  DEFAULT_COLS,
  type Breakpoint,
  type LayoutItem,
  type ResponsiveLayouts,
} from 'react-grid-layout';
import type { Widget } from '#features/widgets/domain/widget.entity';
import { WidgetRules } from '#features/widgets/domain/widget.rules';
import { widgetRegistry } from '#features/widgets/infrastructure/widgetDiscovery';

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isNonNegativeFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function buildInitialLayouts(widgets: Widget[]): ResponsiveLayouts {
  const makeLayout = (breakpoint: Breakpoint): LayoutItem[] =>
    widgets.map((widget) => {
      const widgetDefaults = widgetRegistry.get(widget.type)?.defaultLayout;
      const storedLayout = widget.layout?.[breakpoint] ?? widget.layout?.lg;
      const fallbackLayout =
        widgetDefaults?.[breakpoint] ??
        widgetDefaults?.lg ??
        WidgetRules.FALLBACK_LAYOUT.lg;
      const layout = storedLayout ?? fallbackLayout;
      const breakpointKey = breakpoint as keyof typeof DEFAULT_COLS;
      const columns = DEFAULT_COLS[breakpointKey];
      const fallbackWidth = isPositiveFinite(fallbackLayout.w)
        ? fallbackLayout.w
        : Math.min(WidgetRules.FALLBACK_LAYOUT.lg.w, columns);
      const width = Math.min(
        isPositiveFinite(layout.w) ? layout.w : fallbackWidth,
        columns
      );

      return {
        i: widget.id,
        x: isNonNegativeFinite(layout.x)
          ? Math.min(layout.x, columns - width)
          : 0,
        y: isNonNegativeFinite(layout.y) ? layout.y : 0,
        h: isPositiveFinite(layout.h)
          ? layout.h
          : isPositiveFinite(fallbackLayout.h)
            ? fallbackLayout.h
            : WidgetRules.FALLBACK_LAYOUT.lg.h,
        w: width,
        isDraggable: widget.locked,
        isResizable: widget.locked,
        resizeHandles: ['se'],
      };
    });

  return {
    lg: makeLayout('lg'),
    md: makeLayout('md'),
    sm: makeLayout('sm'),
    xs: makeLayout('xs'),
    xxs: makeLayout('xxs'),
  };
}
