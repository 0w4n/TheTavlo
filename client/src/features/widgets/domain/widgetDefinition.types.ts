// Contrato del sistema de widgets — capa de dominio.
//
// Solo tipos: nada de aquí ejecuta código de React ni de Vite en runtime.
// `ComponentType` se importa con `import type`, así que se borra en compilación
// y no crea una dependencia real hacia React (mismo criterio que ya usa
// widget.entity.ts al importar `Timestamp` o `LayoutItem` como tipos).

import type { ComponentType } from "react";

/**
 * Identificador persistente del widget. Es el valor que se guarda en
 * Firestore (`widget.type`) — debe ser estable para siempre, sin importar
 * cómo se renombren los archivos o carpetas del widget.
 *
 * A propósito NO es una unión de literales: enumerar cada tipo obligaría a
 * tocar un archivo central cada vez que se agrega un widget nuevo, que es
 * exactamente lo que este sistema busca eliminar.
 */
export type WidgetType = string;

export type WidgetCategory =
  | "tasks"
  | "events"
  | "exams"
  | "productivity"
  | "other";

export interface WidgetMetadata {
  name: string;
  description: string;
  icon: string;
  category: WidgetCategory;
}

/** Capacidades declarativas del widget. Todas opcionales y con espacio para
 * crecer (supportsDarkMode, requiresAuthentication, minimumWidth, etc.) sin
 * romper a los widgets existentes. */
export interface WidgetCapabilities {
  resizable?: boolean;
  configurable?: boolean;
  refreshable?: boolean;
}

export interface WidgetLayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

/** Layout por breakpoint (lg/md/sm/xs/xxs). No todos los breakpoints son
 * obligatorios — react-grid-layout cae al más cercano disponible. */
export type WidgetResponsiveLayout = Record<string, WidgetLayoutItem>;

/** Props que recibe el componente pesado de un widget. */
export interface WidgetComponentProps {
  widgetId: string;
  panelId?: string;
  config: Record<string, unknown>;
  multiSelection?: boolean;
}

export type WidgetComponentModule = {
  default: ComponentType<WidgetComponentProps>;
};

export type WidgetQuickAddModule = {
  default: ComponentType<{ onClose: () => void }>;
};

/**
 * Definición completa de un widget. Cada widget escribe UNA de estas en su
 * propio archivo `*.widget.meta.ts`, dentro de su Feature — nunca en un
 * archivo central.
 *
 * `load`/`quickAdd.load` son *thunks*: funciones que devuelven un
 * `import()`. Vite trata cada `import()` como un punto de corte de chunk,
 * así que el componente pesado NO se descarga hasta que algo llama a
 * `load()` — leer la metadata (name/icon/category/defaultConfig/...) nunca
 * dispara esa descarga.
 */
export interface WidgetDefinition {
  type: WidgetType;
  metadata: WidgetMetadata;
  capabilities?: WidgetCapabilities;
  defaultConfig?: Record<string, unknown>;
  defaultLayout?: WidgetResponsiveLayout;
  load: () => Promise<WidgetComponentModule>;
  quickAdd?: {
    load: () => Promise<WidgetQuickAddModule>;
  };
}
