import Icon from "#shared/ui/atoms/icons";
import type { MarkdownActionType } from "./markdownActions";

import "./markdownEditor.css";

interface ToolbarItem {
  action: MarkdownActionType;
  label: string;
  icon: string;
  /** Separador visual antes de este botón (agrupa acciones afines). */
  groupStart?: boolean;
}

const ITEMS: ToolbarItem[] = [
  { action: "bold", label: "Negrita (Ctrl+B)", icon: "IconBold" },
  { action: "italic", label: "Cursiva (Ctrl+I)", icon: "IconItalic" },
  { action: "strikethrough", label: "Tachado", icon: "IconStrikethrough" },
  { action: "heading1", label: "Título 1", icon: "IconH1", groupStart: true },
  { action: "heading2", label: "Título 2", icon: "IconH2" },
  { action: "heading3", label: "Título 3", icon: "IconH3" },
  { action: "quote", label: "Cita", icon: "IconBlockquote", groupStart: true },
  { action: "code", label: "Código en línea", icon: "IconCode" },
  { action: "codeBlock", label: "Bloque de código", icon: "IconSourceCode" },
  { action: "link", label: "Enlace (Ctrl+K)", icon: "IconLink", groupStart: true },
  { action: "image", label: "Imagen", icon: "IconPhoto" },
  { action: "bulletList", label: "Lista con viñetas", icon: "IconList", groupStart: true },
  { action: "numberedList", label: "Lista numerada", icon: "IconListNumbers" },
  { action: "taskList", label: "Lista de tareas", icon: "IconListCheck" },
  { action: "horizontalRule", label: "Línea horizontal", icon: "IconMinus", groupStart: true },
  { action: "table", label: "Tabla", icon: "IconTable" },
];

interface MarkdownToolbarProps {
  onAction: (action: MarkdownActionType) => void;
}

/**
 * Fila de botones de formato. Cada botón inserta/envuelve sintaxis de
 * Markdown en la posición del cursor del textarea asociado (ver
 * `MarkdownTextarea`, que es quien de verdad ejecuta la acción).
 */
export function MarkdownToolbar({ onAction }: MarkdownToolbarProps) {
  return (
    <div className="markdown-toolbar" role="toolbar" aria-label="Formato Markdown">
      {ITEMS.map((item) => (
        <button
          key={item.action}
          type="button"
          className={`markdown-toolbar__button${
            item.groupStart ? " markdown-toolbar__button--group-start" : ""
          }`}
          title={item.label}
          aria-label={item.label}
          // Sin esto, el botón se lleva el foco (y con él la selección) del
          // textarea antes de que la acción pueda leerla.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onAction(item.action)}
        >
          <Icon name={item.icon} size={17} />
        </button>
      ))}
    </div>
  );
}
