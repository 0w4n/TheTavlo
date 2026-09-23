import { useCallback, useRef, type KeyboardEvent, type TextareaHTMLAttributes } from "react";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { applyMarkdownAction, type MarkdownActionType } from "./markdownActions";

import "./markdownEditor.css";

// Atajos de teclado con el textarea enfocado. Van aparte del atajo Ctrl/Cmd+S
// (guardar) del editor, que sigue en el div contenedor y no interfiere.
const KEYBOARD_SHORTCUTS: Record<string, MarkdownActionType> = {
  b: "bold",
  i: "italic",
  k: "link",
};

interface MarkdownTextareaProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onChange" | "value" | "ref"
  > {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Textarea de Markdown con barra de formato. La barra queda oculta cuando
 * `readOnly` o `disabled` son true — no tiene sentido ofrecer formato sobre
 * texto que no se puede editar (DirtyNote en "final", o un viewer sin
 * permiso de edición).
 */
export function MarkdownTextarea({
  value,
  onChange,
  readOnly,
  disabled,
  onKeyDown: onKeyDownProp,
  ...rest
}: MarkdownTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const locked = Boolean(readOnly || disabled);

  const runAction = useCallback(
    (action: MarkdownActionType) => {
      const textarea = textareaRef.current;
      if (!textarea || locked) return;

      const result = applyMarkdownAction(action, {
        value: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
      });

      onChange(result.value);

      // El valor del textarea lo controla React (`value` prop): hay que
      // esperar al siguiente frame, cuando el DOM ya lo refleje, para mover
      // la selección — si no, el navegador la deja al final del texto.
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
      });
    },
    [locked, onChange],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDownProp?.(event);
    if (locked || event.defaultPrevented || !(event.ctrlKey || event.metaKey)) return;
    const action = KEYBOARD_SHORTCUTS[event.key.toLowerCase()];
    if (!action) return;
    event.preventDefault();
    runAction(action);
  };

  return (
    <div className="markdown-textarea">
      {!locked && <MarkdownToolbar onAction={runAction} />}
      <textarea
        {...rest}
        ref={textareaRef}
        className={`markdown-textarea__input${
          rest.className ? ` ${rest.className}` : ""
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        disabled={disabled}
      />
    </div>
  );
}
