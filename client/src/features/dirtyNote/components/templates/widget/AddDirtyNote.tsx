import { useId, useState, type SyntheticEvent } from "react";
import { Modal } from "#components/molecules/modal";
import { Alert } from "#components/molecules/alert";
import { Button } from "#components/atoms/button";
import { Input } from "#components/atoms/input";
import { usePanelRole } from "#features/invitations/presentation/hooks/usePanelRole";
import type { DirtyNoteStatus } from "#features/dirtyNote/domain/DirtyNote.entity";
import {
  DEFAULT_DIRTY_NOTE_STATUS,
  DIRTY_NOTE_TITLE_MAX_LENGTH,
  DirtyNoteRules,
} from "#features/dirtyNote/domain/DirtyNote.rules";
import useDirtyNote from "#features/dirtyNote/presentation/hooks/useDirtyNote";
import { DirtyNoteStatusPicker } from "#features/dirtyNote/components/molecules/DirtyNoteStatusPicker";

import "./addDirtyNote.css";

interface FormErrors {
  title?: string;
  content?: string;
}

/**
 * Formulario del botón "+" del widget (`quickAdd`). Al crear, la DirtyNote
 * aparece sola en la lista gracias a la suscripción en tiempo real.
 */
export default function AddDirtyNote({ onClose }: { onClose: () => void }) {
  const { createDirtyNote } = useDirtyNote();
  const panelRole = usePanelRole();
  const canEdit = panelRole === "owner" || panelRole === "editor";

  const formId = useId();
  const contentId = useId();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<DirtyNoteStatus>(DEFAULT_DIRTY_NOTE_STATUS);
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Misma regla que en el editor: con "final" seleccionado, el contenido no
  // se escribe directamente — hay que redactarla como "sucio"/"en progreso"
  // y pasarla a "final" recién al terminar.
  const isLocked = DirtyNoteRules.isLocked(status);
  const contentDisabled = !canEdit || isLocked;

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!canEdit || isSubmitting) return;

    setSubmitError(null);

    // Misma validación que aplica el servicio, para mostrar el error junto al campo.
    const validation = DirtyNoteRules.validateCreate({ title, content, status });
    if (!validation.success) {
      const fields =
        validation.err.kind === "Validation" ? validation.err.fields : undefined;
      setErrors({ title: fields?.title, content: fields?.content });
      if (!fields) setSubmitError(validation.err.message);
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    const result = await createDirtyNote(validation.value);
    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.err.message);
      return;
    }
    onClose();
  };

  return (
    <>
      <Modal.Header onClose={onClose} title="Nueva DirtyNote" icon="IconMarkdown" />

      <Modal.Body>
        <form
          id={formId}
          className="add-dirty-note"
          onSubmit={(event) => void handleSubmit(event)}
          noValidate
        >
          {!canEdit && (
            <Alert variant="info" role="status">
              Tienes acceso de solo lectura en este panel: no puedes crear
              DirtyNote. Pide al dueño que te dé acceso de editor.
            </Alert>
          )}

          <Input
            label="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={DIRTY_NOTE_TITLE_MAX_LENGTH}
            placeholder="Ej.: Ideas para el proyecto"
            errorMessage={errors.title}
            variant={errors.title ? "error" : "default"}
            disabled={!canEdit}
            autoComplete="off"
          />

          <DirtyNoteStatusPicker
            value={status}
            onChange={setStatus}
            disabled={!canEdit}
          />

          <div className="add-dirty-note__field">
            <label htmlFor={contentId} className="add-dirty-note__label">
              Contenido (Markdown, opcional)
            </label>
            <textarea
              id={contentId}
              className="add-dirty-note__textarea"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              spellCheck
              placeholder={"# Título\n\nEscribe en **Markdown**…"}
              disabled={contentDisabled}
              aria-invalid={errors.content ? true : undefined}
            />
            {isLocked && canEdit && (
              <p className="add-dirty-note__hint">
                Con el estado «Final» el contenido no se puede escribir.
                Redáctala como «Sucio» o «En progreso» y pásala a «Final»
                cuando esté lista.
              </p>
            )}
            {errors.content && (
              <p className="add-dirty-note__error" role="alert">
                {errors.content}
              </p>
            )}
          </div>

          {submitError && (
            <Alert variant="error" role="alert">
              {submitError}
            </Alert>
          )}
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button type="button" variant="secondary" label="Cancelar" onClick={onClose} />
        <Button
          type="submit"
          form={formId}
          variant="primary"
          icon="IconPlus"
          iconSize={18}
          label={isSubmitting ? "Creando…" : "Crear DirtyNote"}
          disabled={!canEdit || isSubmitting}
        />
      </Modal.Footer>
    </>
  );
}
