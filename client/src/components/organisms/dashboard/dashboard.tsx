import type { WidgetsState } from '#features/widgets/presentation/context/widgetReducer';
import { useMemo, useState } from 'react';
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
  Responsive,
  useContainerWidth,
  type LayoutItem,
} from 'react-grid-layout';
import { fastHorizontalCompactor } from 'react-grid-layout/extras';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetErrorBoundary from '#features/widgets/components/templates/base/errorBoundary/WidgetErrorBoundary';
import WidgetContainer from '#features/widgets/components/templates/base/container/WidgetContainer';

type Props = {
  widgetState: WidgetsState;
};

export function Dashboard({ widgetState }: Props) {
  const widgets = widgetState.widgets;
  const { width, containerRef, mounted } = useContainerWidth();

  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [tempLayouts, setTempLayouts] = useState<any>(null);
  const [breakpoint, setBreakpoint] = useState<string>('lg');
  
  const [layouts, setLayouts] = useState<Record<string, LayoutItem[]>>({
    [breakpoint]: widgets.map((value) => ({
      i: value.id,
      ...value.layout[breakpoint],
    }))
  });

  // Memorizamos los hijos correctamente usando map sobre el array de widgets
  const children = useMemo(() => {
    const layouts = {[breakpoint]: widgets.map((value) => ({
      i: value.id,
      ...value.layout[breakpoint],
    }))};
    setLayouts(layouts);
    return widgets.map((item) => (
      <div key={item.id}>
        <WidgetErrorBoundary>
          <WidgetContainer
            type={item.type}
            widget={item}
            editMode={isEditable}
          />
        </WidgetErrorBoundary>
      </div>
    ));
  }, [widgets, isEditable]); // Se vuelve a recalcular si cambian los widgets o el modo edición

  console.log("Layouts: ", layouts)
  console.log("Children: ", children);

  return (
    <div ref={containerRef}>
      {mounted && (
        <Responsive
          className="layout"
          layouts={layouts}
          breakpoints={DEFAULT_BREAKPOINTS}
          cols={DEFAULT_COLS}
          width={width}
          rowHeight={135}
          maxRows={5}
          dragConfig={{ enabled: isEditable }}
          resizeConfig={{ enabled: isEditable, handles: ['se'] }}
          onBreakpointChange={(newBreakpoint) => {
            setBreakpoint(newBreakpoint);
          }}
          onLayoutChange={(_currentLayout, allLayouts) => {
            setTempLayouts(allLayouts);
          }}
          compactor={fastHorizontalCompactor}
        >
          {children}
        </Responsive>
      )}
    </div>
  );
}