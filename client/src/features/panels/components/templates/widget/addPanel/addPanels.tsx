import { Modal } from "#components/molecules/modal";
import type { CreatePanelDTO } from "#features/panels/domain/panel.entity";
import { useState, type SyntheticEvent } from "react";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { Timestamp } from "firebase/firestore";
import { ReturnType } from "#features/panels/presentation/context/panelsContext.types";
import { Button } from "#components/atoms/button";
import { trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import { PanelPreview } from "../panelsWidget";

import "./addPanels.css";

interface AddPanelsForm {
  onClose: () => void;
}

interface EmojiWithHue {
  emoji: string;
  hue: number;
}

function normalizeEmojiSuggestions(response: unknown): EmojiWithHue[] {
  if (Array.isArray(response)) {
    return response as EmojiWithHue[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const entries = Object.entries(response as Record<string, unknown>);

  if (entries.length === 0) {
    return [];
  }

  // Formato esperado: { "😀": 210, "🧁": 42 }
  if (entries.every(([, value]) => typeof value === "number")) {
    return entries.map(([emoji, hue]) => ({ emoji, hue: Number(hue) }));
  }

  // Compatibilidad con payloads antiguos o invertidos: { "0": "😀", "1": "🌮" }
  if (entries.every(([, value]) => typeof value === "string")) {
    return entries.map(([index, emoji]) => ({
      emoji: String(emoji),
      hue: Number(index),
    }));
  }

  // Compatibilidad con objetos anidados: { "0": { emoji: "😀", hue: 210 } }
  return entries.flatMap(([, value]) => {
    if (!value || typeof value !== "object" || !("emoji" in value) || !("hue" in value)) {
      return [];
    }

    return [{
      emoji: String((value as { emoji: string }).emoji),
      hue: Number((value as { hue: number }).hue),
    }];
  });
}

type Step = "name" | "icon" | "review";

export default function AddPanels({ onClose }: AddPanelsForm) {
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
  const [suggestedIcons, setSuggestedIcons] = useState<EmojiWithHue[]>([]);
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
        const response = await trpcQuery<Record<string, number> | EmojiWithHue[] | Record<string, string>>("suggestions.emoji", {
          word: name,
          lang: "es_ES",
        });

        const suggestions = normalizeEmojiSuggestions(response);

        if (!suggestions || suggestions.length === 0) {
          setError("No se encontraron emojis para este nombre.");
          return;
        }

        setSuggestedIcons(suggestions);
        setSelectedIconIndex(0);

        console.log("Sugerencias de emojis:", suggestions);
        
        // Aplica automáticamente el primer emoji y su hue correspondiente al panel
        const firstSuggestion = suggestions[0];
        setPanel((current) => ({
          ...current,
          name,
          icon: firstSuggestion.emoji,
          color: firstSuggestion.hue,
        }));

        console.log("Panel sugerido:", panel);
        
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

  const selectedItem = suggestedIcons[selectedIconIndex];
  const selectedIcon = selectedItem?.emoji ?? panel.icon;

  function selectIcon(index: number) {
    const item = suggestedIcons[index];
    if (!item) return;

    setSelectedIconIndex(index);
    // Actualiza tanto el icono como el color/hue en el estado para la previsualización
    setPanel((current) => ({
      ...current,
      icon: item.emoji,
      color: item.hue,
    }));
  }

  function previousIcon() {
    if (suggestedIcons.length === 0) return;
    const prevIndex = (selectedIconIndex - 1 + suggestedIcons.length) % suggestedIcons.length;
    selectIcon(prevIndex);
  }

  function nextIcon() {
    if (suggestedIcons.length === 0) return;
    const nextIndex = (selectedIconIndex + 1) % suggestedIcons.length;
    selectIcon(nextIndex);
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