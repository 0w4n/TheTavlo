import { useId, useState, type KeyboardEvent } from "react";
import { Modal } from "#components/molecules/modal";
import { Alert } from "#components/molecules/alert";
import { Button } from "#components/atoms/button";
import { Input } from "#components/atoms/input";
import Icon from "#shared/ui/atoms/icons";
import type { DirtyNote } from "#features/dirtyNote/domain/DirtyNote.entity";
import {
  DIRTY_NOTE_CONTENT_MAX_LENGTH,
  DIRTY_NOTE_TITLE_MAX_LENGTH,
  DirtyNoteRules,
} from "#features/dirtyNote/domain/DirtyNote.rules";
import useDirtyNote from "#features/dirtyNote/presentation/hooks/useDirtyNote";
import {
  useDirtyNoteDraft,
  type DirtyNoteSaveState,
} from "#features/dirtyNote/presentation/hooks/useDirtyNoteDraft";
import {
  DirtyNoteExportError,
  downloadDirtyNoteAsMarkdown,
  downloadDirtyNoteAsPdf,
} from "#features/dirtyNote/utils/downloadDirtyNote";
import { DirtyNoteStatusPicker } from "#features/dirtyNote/components/molecules/DirtyNoteStatusPicker";
import { DirtyNotePreview } from "#features/dirtyNote/components/molecules/DirtyNotePreview";

import "./dirtyNoteEditor.css";

interface DirtyNoteEditorProps {
  dirtyNote: DirtyNote;
  /** false para viewers: el editor es de solo lectura pero las descargas siguen disponibles. */
  canEdit: boolean;
  onClose: (open: boolean) => void;
}

type MobileView = "write" | "preview";
type ExportFormat = "md" | "pdf";

const SAVE_INDICATOR: Record<DirtyNoteSaveState, { icon: string; text: string }> = {
  idle: { icon: "IconCloudCheck", text: "Se guarda automáticamente" },
  unsaved: { icon: "IconPencil", text: "Cambios sin guardar…" },
  saving: { icon: "IconLoader", text: "Guardando…" },
  saved: { icon: "IconCloudCheck", text: "Guardado" },
  error: { icon: "IconAlertTriangle", text: "No se pudo guardar" },
};

/**
 * Contenido del modal de edición: título, estado, editor Markdown con vista
 * previa, autoguardado y descargas. Va dentro de un `<Modal>` que pone el
 * llamador (ver DirtyNote.widget.tsx).
 */
export function DirtyNoteEditor({
  dirtyNote,
  canEdit,
  onClose,
}: DirtyNoteEditorProps) {
  const { deleteDirtyNote, updateDirtyNote } = useDirtyNote();
  const {
    draft,
    setTitle,
    setContent,
    setStatus,
    saveNow,
    discardPending,
    saveState,
    saveError,
    titleError,
    readOnly,
    isLocked,
  } = useDirtyNoteDraft({
    dirtyNote,
    onSave: updateDirtyNote,
    readOnly: !canEdit,
  });

  const textareaId = useId();
  const counterId = useId();

  const [mobileView, setMobileView] = useState<MobileView>("write");
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const displayTitle = draft.title.trim() || "Sin título";
  const canExport = DirtyNoteRules.isExportable(draft.content);
  const contentLength = draft.content.length;
  const overLimit = contentLength > DIRTY_NOTE_CONTENT_MAX_LENGTH;
  const nearLimit = contentLength >= DIRTY_NOTE_CONTENT_MAX_LENGTH * 0.9;
  // El bloqueo por "final" es independiente del rol: nadie edita el título
  // ni el contenido mientras esté en ese estado, ni siquiera el dueño.
  const titleFieldReadOnly = readOnly || isLocked;
  const indicator = readOnly
    ? { icon: "IconEye", text: "Solo lectura" }
    : isLocked
      ? { icon: "IconLock", text: "Final: solo lectura" }
      : SAVE_INDICATOR[saveState];

  // Ctrl/Cmd + S guarda ya en vez de abrir "Guardar página" del navegador.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void saveNow();
    }
  };

  // Se exporta el borrador en pantalla, no lo último guardado: lo que ves es lo que descargas.
  const handleExport = async (format: ExportFormat) => {
    setExportError(null);
    setExporting(format);
    try {
      const snapshot = { title: draft.title, content: draft.content };
      if (format === "md") {
        downloadDirtyNoteAsMarkdown(snapshot);
      } else {
        await downloadDirtyNoteAsPdf(snapshot);
      }
    } catch (error) {
      console.error("[dirtyNote] falló la exportación", error);
      setExportError(
        error instanceof DirtyNoteExportError && error.reason === "too-long"
          ? "La DirtyNote es demasiado larga para exportarla a PDF. Descárgala como .md o divídela en partes más cortas."
          : "No se pudo generar el archivo. Intenta nuevamente.",
      );
    } finally {
      setExporting(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteDirtyNote(dirtyNote.id);
    if (!result.success) {
      setDeleteError(result.err.message);
      setIsDeleting(false);
      return;
    }

    // Sin esto, al cerrarse el editor se reintentaría guardar sobre un
    // documento que ya no existe.
    discardPending();
    onClose(false);
  };

  return (
    <>
      <Modal.Header onClose={onClose} title={displayTitle} icon="IconMarkdown" />

      <Modal.Body>
        <div className="dirty-note-editor" onKeyDown={handleKeyDown}>
          <div className="dirty-note-editor__meta">
            <Input
              label="Título"
              value={draft.title}
              onChange={(event) => setTitle(event.target.value)}
              readOnly={titleFieldReadOnly}
              required
              maxLength={DIRTY_NOTE_TITLE_MAX_LENGTH}
              errorMessage={titleError}
              variant={titleError ? "error" : "default"}
              autoComplete="off"
            />
            <DirtyNoteStatusPicker
              value={draft.status}
              onChange={setStatus}
              disabled={readOnly}
            />
          </div>

          <div className="dirty-note-editor__toolbar">
            {/* Solo en pantallas angostas, donde no caben editor y vista previa lado a lado. */}
            {!isLocked && (
              <div
                className="dirty-note-editor__views"
                role="group"
                aria-label="Vista del editor"
              >
                <Button
                  type="button"
                  size="sm"
                  variant={mobileView === "write" ? "primary" : "secondary"}
                  aria-pressed={mobileView === "write"}
                  onClick={() => setMobileView("write")}
                  className="dirty-note-editor__button"
                >
                  Escribir
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mobileView === "preview" ? "primary" : "secondary"}
                  aria-pressed={mobileView === "preview"}
                  onClick={() => setMobileView("preview")}
                  className="dirty-note-editor__button"
                >
                  Vista previa
                </Button>
              </div>
            )}

            <div className="dirty-note-editor__actions">
              <div
                className="dirty-note-editor__save"
                data-state={readOnly ? "readonly" : isLocked ? "locked" : saveState}
                role="status"
                aria-live="polite"
              >
                <span aria-hidden="true">
                  <Icon name={indicator.icon} size={16} />
                </span>
                {indicator.text}
              </div>

              {saveState === "error" && !readOnly && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  icon="IconRefresh"
                  iconSize={16}
                  label="Reintentar"
                  onClick={() => void saveNow()}
                  className="dirty-note-editor__button"
                />
              )}

              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon="IconMarkdown"
                iconSize={18}
                label="Descargar .md"
                disabled={!canExport || exporting !== null}
                onClick={() => void handleExport("md")}
                className="dirty-note-editor__button"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon="IconFileTypePdf"
                iconSize={18}
                label={exporting === "pdf" ? "Generando PDF…" : "Descargar .pdf"}
                disabled={!canExport || exporting !== null}
                aria-busy={exporting === "pdf"}
                onClick={() => void handleExport("pdf")}
                className="dirty-note-editor__button"
              />
            </div>
          </div>

          {isLocked && (
            <Alert variant="info" role="status">
              Esta DirtyNote está en <strong>Final</strong>: se muestra en
              Markdown renderizado y el título y el contenido no se pueden
              editar directamente.
              {canEdit &&
                " Cambia el estado a «Sucio» o «En progreso» para volver a editarla."}
            </Alert>
          )}
          {saveState === "error" && !readOnly && saveError && (
            <Alert variant="error" role="alert">
              {saveError.message} Tus cambios siguen en pantalla y se volverán a
              intentar guardar al seguir editando.
            </Alert>
          )}
          {exportError && (
            <Alert
              variant="error"
              role="alert"
              dismissible
              onDismiss={() => setExportError(null)}
            >
              {exportError}
            </Alert>
          )}

          <div
            className={`dirty-note-editor__panes${
              isLocked ? " dirty-note-editor__panes--single" : ""
            }`}
            data-view={isLocked ? "preview" : mobileView}
          >
            {!isLocked && (
              <section className="dirty-note-editor__pane dirty-note-editor__pane--write">
                <label htmlFor={textareaId} className="dirty-note-editor__label">
                  Contenido (Markdown)
                </label>
                <textarea
                  id={textareaId}
                  className="dirty-note-editor__textarea"
                  value={draft.content}
                  onChange={(event) => setContent(event.target.value)}
                  readOnly={readOnly}
                  spellCheck
                  placeholder={
                    readOnly ? "" : "# Título\n\nEscribe en **Markdown**…"
                  }
                  aria-describedby={nearLimit ? counterId : undefined}
                  aria-invalid={overLimit || undefined}
                />
                {nearLimit && (
                  <p
                    id={counterId}
                    className={`dirty-note-editor__counter${
                      overLimit ? " dirty-note-editor__counter--error" : ""
                    }`}
                  >
                    {contentLength.toLocaleString("es")} /{" "}
                    {DIRTY_NOTE_CONTENT_MAX_LENGTH.toLocaleString("es")} caracteres
                    {overLimit
                      ? ". Reduce el contenido o divídelo en más de una DirtyNote para poder guardarlo."
                      : ""}
                  </p>
                )}
              </section>
            )}

            <section
              className="dirty-note-editor__pane dirty-note-editor__pane--preview"
              aria-label="Vista previa"
            >
              <span className="dirty-note-editor__label" aria-hidden="true">
                Vista previa
              </span>
              <div className="dirty-note-editor__preview">
                <DirtyNotePreview content={draft.content} />
              </div>
            </section>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="dirty-note-editor__footer">
          {canEdit && (
            <div className="dirty-note-editor__delete">
              {confirmingDelete ? (
                <div
                  className="dirty-note-editor__confirm"
                  role="group"
                  aria-label="Confirmar eliminación"
                >
                  <p className="dirty-note-editor__confirm-text">
                    ¿Eliminar «{displayTitle}» de forma permanente? No se puede
                    deshacer.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    label="Cancelar"
                    disabled={isDeleting}
                    onClick={() => {
                      setConfirmingDelete(false);
                      setDeleteError(null);
                    }}
                    className="dirty-note-editor__button"
                    // Foco en la opción segura: Enter por accidente no borra.
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="danger"
                    icon="IconTrash"
                    iconSize={18}
                    label={isDeleting ? "Eliminando…" : "Eliminar permanentemente"}
                    disabled={isDeleting}
                    onClick={() => void handleDelete()}
                    className="dirty-note-editor__button"
                  />
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  icon="IconTrash"
                  iconSize={18}
                  label="Eliminar"
                  onClick={() => setConfirmingDelete(true)}
                  className="dirty-note-editor__button dirty-note-editor__button--danger"
                />
              )}
              {deleteError && (
                <Alert variant="error" role="alert">
                  {deleteError}
                </Alert>
              )}
            </div>
          )}

          {/* Siempre presente y siempre al final: el trampa-foco del Modal fija su último elemento al abrirse. */}
          <Button
            type="button"
            variant="primary"
            label="Cerrar"
            onClick={() => onClose(false)}
            className="dirty-note-editor__button dirty-note-editor__close"
          />
        </div>
      </Modal.Footer>
    </>
  );
}
