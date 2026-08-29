import { Modal } from "#components/molecules/modal";
import type { CreatePanelDTO } from "#features/panels/domain/panel.entity";
import { useState, type SyntheticEvent } from "react";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { Timestamp } from "firebase/firestore";
import { ReturnType } from "#features/panels/presentation/context/panelsContext.types";
import { Button } from "#components/atoms/button";

import "./addPanels.css";
import { PanelPreview } from "../panelsWidget";

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
      <Modal.Body className="add-panel__body">
        <PanelPreview panel={panel} />
        <form onSubmit={handleCreatePanels} method="post">
          <Field label="Titulo" required error={errors.title}>
            <input
              type="text"
              value={panel?.name}
              placeholder="Titulo del panel"
              onChange={(e) => {
                setPanel((p) => ({ ...p, name: e.target.value }));
                setErrors((err) => ({ ...err, title: undefined }));
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
                setErrors((err) => ({ ...err, icon: undefined }));
              }}
            />
          </Field>
          <Field label="Color" required error={errors.color?.toString()}>
            <div style={{ display: "flex", gap: "var(--spacing-4)", flexWrap: "wrap" }}>
              {Array.from({ length: 320 / 20 }).map((_, i) => {
                const hue = i * 20;
                return (
                  <div
                    key={hue}
                    style={{
                      backgroundColor: `hsl(${hue}, 100%, 20%)`,
                      height: "25px",
                      width: "25px",
                      cursor: "pointer",
                      userSelect: "none",
                      borderRadius: "100%",
                    }}
                    onClick={() => {
                      setPanel((p) => ({ ...p, color: hue }));
                      setErrors((err) => ({ ...err, color: undefined }));
                    }}
                  />
                );
              })}
            </div>
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
