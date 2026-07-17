import { Modal } from "#components/molecules/modal";
import type { CreatePanelDTO } from "#features/panels/domain/panel.entity";
import { useState, type SyntheticEvent } from "react";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { Timestamp } from "firebase/firestore";
import { ReturnType } from "#features/panels/presentation/context/panelsContext.types";
import { Button } from "#components/atoms/button";

import "./addPanels.css";

interface AddPanelsForm {
  onClose: () => void;
}

interface FormError {
  title?: string;
  color?: number;
  icon?: string;
}

export function AddPanels({ onClose }: AddPanelsForm) {
  const now = Timestamp.now();

  const initPanel: CreatePanelDTO = {
    parentId: null,
    name: "",
    color: 0,
    icon: "",
    sharedWith: null,
    createdAt: now,
    updatedAt: now,
  };

  const [panel, setPanel] = useState<CreatePanelDTO>(initPanel);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormError>({});

  const { createPanel } = usePanels();

  async function handleCreatePanels(e: SyntheticEvent) {
    e.preventDefault();
    try {
      setIsLoading(true);

      await createPanel(panel, {
        addToParent: true,
        return: ReturnType.DEFAULT,
      });
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error desconocido al crear el panel",
      );
    } finally {
      setIsLoading(false);
      onClose();
    }
  }

  return (
    <>
      <Modal.Header onClose={onClose} title="Nuevo panel"></Modal.Header>
      <Modal.Body>
        <form onSubmit={handleCreatePanels} method="post">
          <Field label="Titulo" required error={errors.title}>
            <input
              type="text"
              value={panel?.name}
              placeholder="Titulo del panel"
              onChange={(e) => {
                setPanel((p) => ({ ...p, name: e.target.value }));

                setErrors((er) => ({ ...er, title: undefined }));
              }}
            />
          </Field>
          <Field label="Icono que lo representa" required error={errors.icon}>
            <input
              type="text"
              value={panel?.icon}
              placeholder="Icono que lo representa"
              onChange={(e) => {
                setPanel((p) => ({ ...p, icon: e.target.value }));

                setErrors((er) => ({ ...er, icon: undefined }));
              }}
            />
          </Field>
          <Field label="Color" required error={errors.color?.toString()}>
            <input
              type="number"
              value={panel?.color}
              placeholder="Color del panel (0-360)"
              min={0}
              max={360}
              step={2}
              onChange={(e) => {
                setPanel((p) => ({ ...p, color: e.target.valueAsNumber }));
                setErrors((er) => ({ ...er, color: undefined }));
              }}
            />
            <div
              style={{
                backgroundColor: `hsl(${panel?.color}, 100%, 80%)`,
                width: "20px",
                height: "20px",
              }}
            ></div>
          </Field>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div className="add-panel__footer">
          {onClose && (
            <Button
              type="button"
              onClick={onClose}
              label="Cancelar"
              className="add-panel__btn-ghost"
              disabled={isLoading}
            />
          )}

          <Button
            type="button"
            className="add-panel__btn-primary"
            label={isLoading ? "Creando..." : "Crear panel"}
            disabled={isLoading}
            onClick={handleCreatePanels}
          />
        </div>
      </Modal.Footer>
    </>
  );
}

// ─── Field ───────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field__label">
        {label + "   "}

        {required && (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}

      {hint && !error && <p className="field__hint">{hint}</p>}
    </div>
  );
}
