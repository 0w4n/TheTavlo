import { Modal } from "#components/molecules/modal";
import type { CreatePanelDTO } from "#features/panels/domain/panel.entity";
import { useState, type SyntheticEvent } from "react";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { Timestamp } from "firebase/firestore";

import "./addPanels.css";
import { returnTypes } from "#features/panels/presentation/context/panelsContext.types";

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
    name: "",
    color: 0,
    icon: "",
    isDefault: false,
    sharedWith: "",
    subPanelsId: [],
    createdAt: now,
    updatedAt: now,
  };

  const [panel, setPanel] = useState<CreatePanelDTO>(initPanel);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormError>({});

  const { createPanel } = usePanels();

  async function handleCreatePanels(e: SyntheticEvent) {
    e.preventDefault();

    setIsLoading(true);

    await createPanel(panel, {addToParent: true, return: returnTypes.DEFAULT});
    onClose();
  }

  return (
    <>
      <Modal.Header onClose={onClose}>
        <p>Crear panel</p>
      </Modal.Header>
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
          <Field label="Colores" required error={errors.color?.toString()}>
            <input
              type="number"
              value={panel?.color}
              min={0}
              max={360}
              step={1}
              onChange={(e) => {
                setPanel((p) => ({ ...p, color: e.target.valueAsNumber }));

                setErrors((er) => ({ ...er, color: undefined }));
              }}
            />
          </Field>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div className="add-panel__footer">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="add-panel__btn-ghost"
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="add-panel__btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creando..." : "Crear panel"}
          </button>
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
        {label}

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
