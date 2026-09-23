import { useDeferredValue, useMemo } from "react";
import { renderDirtyNoteMarkdown } from "#features/dirtyNote/utils/renderMarkdown";

import "./dirtyNotePreview.css";

/**
 * Vista previa del Markdown. El HTML SIEMPRE pasa por
 * `renderDirtyNoteMarkdown` (sanitizado): es lo único que justifica el
 * `dangerouslySetInnerHTML`.
 *
 * `useDeferredValue` mantiene el textarea fluido en notas largas: React
 * prioriza lo que se teclea y renderiza la vista previa cuando puede.
 */
export function DirtyNotePreview({ content }: { content: string }) {
  const deferred = useDeferredValue(content);
  const html = useMemo(() => renderDirtyNoteMarkdown(deferred), [deferred]);

  if (content.trim().length === 0) {
    return (
      <p className="dirty-note-preview__empty">
        La vista previa aparecerá aquí cuando empieces a escribir.
      </p>
    );
  }

  return (
    <div
      className="dirty-note-preview"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
