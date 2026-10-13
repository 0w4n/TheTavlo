import { describe, expect, it } from 'vitest';
import { DEFAULT_COLS } from 'react-grid-layout';
import type { Widget } from '#features/widgets/domain/widget.entity';
import { buildInitialLayouts } from './dashboardLayout';

function makeWidget(layout: Partial<Widget['layout']>): Widget {
  return {
    id: 'widget-1',
    type: 'cooking-book',
    layout: layout as Widget['layout'],
    config: {},
    locked: false,
    createdAt: {} as Widget['createdAt'],
    updatedAt: {} as Widget['updatedAt'],
  };
}

describe('buildInitialLayouts', () => {
  it('recovers zero or invalid dimensions from the widget defaults', () => {
    const widget = makeWidget({
      lg: { x: 0, y: 0, w: 0, h: Number.NaN },
    });

    const layouts = buildInitialLayouts([widget]);

    expect(layouts.lg?.[0]).toMatchObject({ w: 3, h: 2 });
  });

  it('preserves valid dimensions and caps widths to each breakpoint', () => {
    const widget = makeWidget({
      lg: { x: 0, y: 0, w: 5, h: 4 },
    });

    const layouts = buildInitialLayouts([widget]);

    expect(layouts.lg?.[0]).toMatchObject({ w: 5, h: 4 });
    expect(layouts.xxs?.[0]?.w).toBeLessThanOrEqual(DEFAULT_COLS.xxs);
  });
});
