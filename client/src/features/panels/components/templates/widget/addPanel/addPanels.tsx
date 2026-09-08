import { Modal } from "#components/molecules/modal";
import type { CreatePanelDTO } from "#features/panels/domain/panel.entity";
import { useState, type SyntheticEvent } from "react";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { Timestamp } from "firebase/firestore";
import { ReturnType } from "#features/panels/presentation/context/panelsContext.types";
import { Button } from "#components/atoms/button";
import { trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";

import "./addPanels.css";
import { PanelPreview } from "../panelsWidget";

interface AddPanelsForm {
  onClose: () => void;
}

type Step = "name" | "icon" | "review";

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
  const [step, setStep] = useState<Step>("name");
  const [suggestedIcons, setSuggestedIcons] = useState<string[]>([]);
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const { createPanel } = usePanels();

  async function handleNext(e: SyntheticEvent) {
    e.preventDefault();

    if (step === "name") {
      const name = panel.name.trim();
      if (!name) {
        setError("Escribe un nombre para el panel.");
        return;
      }

      setError(undefined);
      setIsLoading(true);
      try {
        const response = await trpcQuery<string>("suggestions.emoji", {
          word: name,
          lang: "es_ES",
        });
        const icons = Array.from(response.trim()).filter(Boolean);
        if (icons.length === 0) {
          console.log(icons)
          setError("No se encontraron emojis para este nombre.");
          return;
        }
        setSuggestedIcons(icons);
        setSelectedIconIndex(0);
        setPanel((current) => ({ ...current, name, icon: icons[0] }));
        setStep("icon");
      } catch {
        setError("No se pudieron obtener sugerencias de emojis.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === "icon") {
      setStep("review");
    }
  }

  async function handleCreatePanels(e: SyntheticEvent) {
    e.preventDefault();
    try {
      setIsLoading(true);
      await createPanel(panel, {
        addToParent: true,
        return: ReturnType.DEFAULT,
      });
      onClose();
    } catch {
      setError("No se pudo crear el panel.");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedIcon = suggestedIcons[selectedIconIndex] ?? panel.icon;

  function selectIcon(index: number) {
    setSelectedIconIndex(index);
    setPanel((current) => ({ ...current, icon: suggestedIcons[index] }));
  }

  function previousIcon() {
    selectIcon(
      (selectedIconIndex - 1 + suggestedIcons.length) % suggestedIcons.length,
    );
  }

  function nextIcon() {
    selectIcon((selectedIconIndex + 1) % suggestedIcons.length);
  }

  return (
    <>
      <Modal.Header onClose={onClose} title="Nuevo panel"></Modal.Header>
      <Modal.Body className="add-panel__body">
        {step !== "name" && <PanelPreview panel={panel} />}
        <form onSubmit={step === "review" ? handleCreatePanels : handleNext} method="post">
          {step === "name" && (
            <Field label="Nombre" required error={error}>
            <input
              type="text"
              value={panel?.name}
              placeholder="Nombre del panel"
              onChange={(e) => {
                setPanel((p) => ({ ...p, name: e.target.value }));
                setError(undefined);
              }}
            />
            </Field>
          )}

          {step === "icon" && (
            <Field label="Elige un emoji" required error={error}>
              <div className="emoji-carousel" aria-label="Emojis sugeridos">
                <Button type="button" variant="ghost" label="Anterior" onClick={previousIcon} />
                <button
                  type="button"
                  className="emoji-carousel__option"
                  onClick={() => selectIcon(selectedIconIndex)}
                  aria-label={`Emoji ${selectedIcon}`}
                >
                  {selectedIcon}
                </button>
                <Button type="button" variant="ghost" label="Siguiente" onClick={nextIcon} />
              </div>
              <span className="emoji-carousel__position">
                {selectedIconIndex + 1} de {suggestedIcons.length}
              </span>
            </Field>
          )}

          {step === "review" && (
            <Field label="Opciones del panel" required error={error}>
              <div className="add-panel__summary">
                <span>{panel.name}</span>
                <span className="add-panel__summary-icon">{panel.icon}</span>
              </div>
              <span className="add-panel__color-label">Elige un color</span>
              <div className="add-panel__colors">
                {Array.from({ length: 320 / 20 }).map((_, i) => {
                  const hue = i * 20;
                  return (
                    <button
                      key={hue}
                      type="button"
                      className={`add-panel__color${panel.color === hue ? " add-panel__color--selected" : ""}`}
                      style={{ backgroundColor: `hsl(${hue}, 100%, 20%)` }}
                      aria-label={`Color ${hue}`}
                      aria-pressed={panel.color === hue}
                      onClick={() => {
                        setPanel((p) => ({ ...p, color: hue }));
                        setError(undefined);
                      }}
                    />
                  );
                })}
              </div>
            </Field>
          )}
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
            label={isLoading ? "Cargando..." : step === "review" ? "Añadir panel" : "Continuar"}
            disabled={isLoading}
            onClick={step === "review" ? handleCreatePanels : handleNext}
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
