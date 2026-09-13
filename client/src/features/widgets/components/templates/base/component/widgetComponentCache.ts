import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type {
  WidgetComponentProps,
  WidgetDefinition,
} from "#features/widgets/domain/widgetDefinition.types";

// `React.lazy(definition.load)` no debe llamarse en cada render — cada
// llamada crea un componente nuevo, lo que reinicia el Suspense y remonta
// el widget. Por eso el resultado se cachea por `type`, una sola vez.

const componentCache = new Map<
  string,
  LazyExoticComponent<ComponentType<WidgetComponentProps>>
>();

const quickAddCache = new Map<
  string,
  LazyExoticComponent<ComponentType<{ onClose: () => void }>>
>();

export function getLazyWidgetComponent(
  definition: WidgetDefinition,
): LazyExoticComponent<ComponentType<WidgetComponentProps>> {
  const cached = componentCache.get(definition.type);
  if (cached) return cached;

  const Component = lazy(definition.load);
  componentCache.set(definition.type, Component);
  return Component;
}

export function getLazyQuickAdd(
  definition: WidgetDefinition,
): LazyExoticComponent<ComponentType<{ onClose: () => void }>> | undefined {
  if (!definition.quickAdd) return undefined;

  const cached = quickAddCache.get(definition.type);
  if (cached) return cached;

  const Component = lazy(definition.quickAdd.load);
  quickAddCache.set(definition.type, Component);
  return Component;
}
