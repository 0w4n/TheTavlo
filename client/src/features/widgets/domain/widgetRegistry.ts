import type { WidgetDefinition, WidgetType } from "./widgetDefinition.types";

/** Se lanza cuando se intenta registrar dos widgets con el mismo `type`. */
export class DuplicateWidgetTypeError extends Error {
  constructor(type: WidgetType) {
    super(
      `El widget "${type}" ya está registrado. Cada "type" debe ser único ` +
        `— revisa los archivos *.widget.meta.ts de las Features involucradas.`,
    );
    this.name = "DuplicateWidgetTypeError";
  }
}

/**
 * Registro de widgets. No conoce ningún widget concreto: solo guarda lo que
 * alguien más (el discovery, o un test) le registre. Sin dependencias de
 * React ni de Vite — 100% testeable en aislamiento.
 */
export class WidgetRegistry {
  private readonly definitions = new Map<WidgetType, WidgetDefinition>();

  register(definition: WidgetDefinition): void {
    if (this.definitions.has(definition.type)) {
      throw new DuplicateWidgetTypeError(definition.type);
    }
    this.definitions.set(definition.type, definition);
  }

  get(type: WidgetType): WidgetDefinition | undefined {
    return this.definitions.get(type);
  }

  has(type: WidgetType): boolean {
    return this.definitions.has(type);
  }

  getAll(): WidgetDefinition[] {
    return Array.from(this.definitions.values());
  }
}
