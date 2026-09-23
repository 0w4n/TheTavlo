import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import LoadingPage from "#components/pages/LoadingPage";
import { Modal } from "#components/molecules/modal";
import { Alert } from "#components/molecules/alert";
import { usePanelRole } from "#features/invitations/presentation/hooks/usePanelRole";
import useDirtyNote from "#features/dirtyNote/presentation/hooks/useDirtyNote";
import { getDirtyNoteExcerpt } from "#features/dirtyNote/utils/excerpt";
import { DirtyNoteStatusBadge } from "#features/dirtyNote/components/molecules/DirtyNoteStatusBadge";
import { DirtyNoteEditor } from "#features/dirtyNote/components/templates/editor/DirtyNoteEditor";

import "./dirtyNoteWidget.css";

const dateFormatter = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function DirtyNoteWidget() {
  const { state } = useDirtyNote();
  const panelRole = usePanelRole();
  const canEdit = panelRole === "owner" || panelRole === "editor";

  const [openId, setOpenId] = useState<string | null>(null);
  const closeEditor = useCallback(() => setOpenId(null), []);

  if (state.status === "loading") return <LoadingPage />;

  if (state.status === "error") {
    return (
      <Alert variant="error" role="alert">
        No se pudieron cargar las DirtyNote. Recarga la página; si el problema
        continúa, revisa tu conexión.
      </Alert>
    );
  }

  const { items } = state;
  // El editor vive mientras la DirtyNote exista: si otro colaborador la
  // elimina con el editor abierto, `openNote` pasa a undefined y se cierra solo.
  const openNote = openId ? items.find((item) => item.id === openId) : undefined;

  return (
    <div className="dirty-note-widget">
      {items.length === 0 ? (
        <p className="dirty-note-widget__empty">
          {canEdit
            ? "Todavía no hay DirtyNote en este panel. Usa el botón + para crear la primera."
            : "Este panel todavía no tiene DirtyNote."}
        </p>
      ) : (
        <ul className="dirty-note-widget__list">
          {items.map((item) => {
            const excerpt = getDirtyNoteExcerpt(item.content);
            const hasDate = item.updatedAt.toMillis() > 0;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="dirty-note-widget__item"
                  aria-haspopup="dialog"
                  onClick={() => setOpenId(item.id)}
                >
                  <span className="dirty-note-widget__item-head">
                    <span className="dirty-note-widget__title">
                      {item.title.trim() || "Sin título"}
                    </span>
                    <DirtyNoteStatusBadge status={item.status} />
                  </span>
                  <span className="dirty-note-widget__excerpt">
                    {excerpt || "Sin contenido"}
                  </span>
                  {hasDate && (
                    <time
                      className="dirty-note-widget__date"
                      dateTime={item.updatedAt.toDate().toISOString()}
                    >
                      Editada {dateFormatter.format(item.updatedAt.toDate())}
                    </time>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openNote &&
        createPortal(
          <Modal size="xl" onClose={closeEditor}>
            <DirtyNoteEditor
              key={openNote.id}
              dirtyNote={openNote}
              canEdit={canEdit}
              onClose={closeEditor}
            />
          </Modal>,
          document.body,
        )}
    </div>
  );
}
