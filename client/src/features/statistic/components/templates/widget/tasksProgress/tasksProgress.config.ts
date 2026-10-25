// Datos del widget compartidos entre su metadata (liviana, se lee en el
// picker "Añadir widget") y su componente. Es un archivo mínimo a propósito:
// la metadata puede importarlo sin arrastrar React ni el resto del widget.
export const SOURCE_ID = "tasks";

export const DEFAULT_STATISTIC_IDS = [
  "tasks.completion-rate",
  "tasks.status-breakdown",
] as const;
