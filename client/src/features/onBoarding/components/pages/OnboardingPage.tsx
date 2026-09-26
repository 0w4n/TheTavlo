import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import useAnnounce from "#core/a11y/useAnnounce";
import { useDocumentTitle } from "#core/routing/useDocumentTitle";
import { Button } from "#components/atoms/button";
import { Input } from "#components/atoms/input";
import { Timestamp } from "firebase/firestore";
import { trpcPublicQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { CreatePanelDTO } from "#features/panels/domain/panel.entity";
import { PanelPreview } from "#features/panels/components/templates/widget/panelsWidget";
import { savePendingOnboarding } from "../../infraestructure/onBoardingStorage";
import { safeReturnTo } from "#core/routing/returnTo";

import StepAuth from "./onBoardingStep/auth.step";

import "./OnboardingPage.css";

/**
 * Onboarding de TheTavlo — se muestra en `/register`; `/login?onBoarding`
 * se conserva como enlace legacy.
 *
 * Decisiones de diseño, por si alguien retoma esto después:
 *
 * 1. El flujo replica el alta manual: nombre, sugerencias de emoji/color,
 *    revisión y creación del panel debajo del panel principal.
 * 2. Accesibilidad: foco se mueve al contenido del paso en cada cambio
 *    (`stageRef`), cada paso se anuncia por `useAnnounce` para lectores de
 *    pantalla, todo es operable por teclado (son <button> nativos), los
 *    errores se describen en texto (no solo con color), y se respeta
 *    `prefers-reduced-motion` tanto en CSS como en el confetti final.
 * 3. El plan se persiste vía `savePendingOnboarding` (ver
 *    `onboardingStorage.ts`) porque esta página está fuera de
 *    PanelsProvider/WidgetsProvider — aplicarlo de verdad pasa después,
 *    en `useOnBoardingBootstrap`, llamado desde `HomePage`.
 */

const TOTAL_STEPS = 4;

interface EmojiSuggestion {
  emoji: string;
  hue: number;
}

function normalizeEmojiSuggestions(response: unknown): EmojiSuggestion[] {
  if (Array.isArray(response)) {
    return response.filter(
      (item): item is EmojiSuggestion =>
        !!item &&
        typeof item === "object" &&
        "emoji" in item &&
        "hue" in item &&
        typeof item.emoji === "string" &&
        typeof item.hue === "number",
    );
  }

  if (!response || typeof response !== "object") return [];

  const entries = Object.entries(response as Record<string, unknown>);
  if (entries.every(([, value]) => typeof value === "number")) {
    return entries.map(([emoji, hue]) => ({ emoji, hue: Number(hue) }));
  }
  if (entries.every(([, value]) => typeof value === "string")) {
    return entries.map(([index, emoji]) => ({
      emoji: String(emoji),
      hue: Number(index),
    }));
  }

  return entries.flatMap(([, value]) => {
    if (
      !value ||
      typeof value !== "object" ||
      !("emoji" in value) ||
      !("hue" in value)
    ) {
      return [];
    }
    return [{
      emoji: String(value.emoji),
      hue: Number(value.hue),
    }];
  });
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function OnboardingPage() {
  useDocumentTitle("Bienvenida");

  const { signInAsGuest, signInWithGoogle, state } = useAuth();
  const announce = useAnnounce();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const isNewUserFlow = searchParams.get("newUser") === "1";
  const stageRef = useRef<HTMLDivElement>(null);
  const justCompletedRef = useRef(false);

  const [step, setStep] = useState(1);
  const [panelName, setPanelName] = useState("");
  const [panelIcon, setPanelIcon] = useState("");
  const [panelColor, setPanelColor] = useState(0);
  const [emojiSuggestions, setEmojiSuggestions] = useState<EmojiSuggestion[]>([]);
  const [selectedEmojiIndex, setSelectedEmojiIndex] = useState(0);
  const [formError, setFormError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [authSucceeded, setAuthSucceeded] = useState(false);

  const panelPreview: CreatePanelDTO = {
    parentId: null,
    name: panelName,
    color: panelColor,
    icon: panelIcon,
    sharedWith: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Si ya hay sesión activa (alguien llegó a esta URL por error, o volvió
  // atrás en el navegador después de loguearse), no tiene sentido mostrar
  // el onboarding — lo mandamos directo a su espacio.
  useEffect(() => {
    if (
      state.status === "authenticated" &&
      !justCompletedRef.current &&
      !isNewUserFlow
    ) {
      navigate(returnTo ?? "/home", { replace: true });
    }
  }, [state.status, navigate, returnTo, isNewUserFlow]);

  // Foco + anuncio en cada cambio de paso: quien navega con teclado no
  // pierde su lugar, y quien usa lector de pantalla se entera del cambio
  // aunque no haya recarga de página.
  useEffect(() => {
    stageRef.current?.focus();
    announce(`Paso ${step} de ${TOTAL_STEPS}`);
  }, [step, announce]);

  function persistDraft(icon = panelIcon, color = panelColor) {
    savePendingOnboarding({
      panelName: panelName.trim(),
      panelIcon: icon,
      panelColor: color,
    });
  }

  async function goNext() {
    if (step === 1) {
      const name = panelName.trim();
      if (!name) {
        setFormError("Escribe un nombre para el panel.");
        return;
      }

      setIsLoading(true);
      setFormError(undefined);
      try {
        const response = await trpcPublicQuery<Record<string, number> | EmojiSuggestion[]>(
          "suggestions.emoji",
          { word: name, lang: "es_ES" },
        );
        const suggestions = normalizeEmojiSuggestions(response);
        if (suggestions.length === 0) {
          setFormError("No se encontraron emojis para este nombre.");
          return;
        }

        const firstSuggestion = suggestions[0];
        setEmojiSuggestions(suggestions);
        setSelectedEmojiIndex(0);
        setPanelIcon(firstSuggestion.emoji);
        setPanelColor(firstSuggestion.hue);
        savePendingOnboarding({
          panelName: name,
          panelIcon: firstSuggestion.emoji,
          panelColor: firstSuggestion.hue,
        });
        setStep(2);
      } catch {
        setFormError("No se pudieron obtener sugerencias de emojis.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    persistDraft();
    setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  }

  function goBack() {
    setStep((current) => Math.max(1, current - 1));
  }

  function selectEmoji(index: number) {
    const suggestion = emojiSuggestions[index];
    if (!suggestion) return;
    setSelectedEmojiIndex(index);
    setPanelIcon(suggestion.emoji);
    setPanelColor(suggestion.hue);
  }

  async function completeAuth(action: () => Promise<unknown>) {
    setAuthLoading(true);
    justCompletedRef.current = true;
    try {
      persistDraft();
      await action();
      setAuthSucceeded(true);
      announce("Cuenta lista. Preparando tu espacio.");
      if (!prefersReducedMotion()) {
        confetti({
          particleCount: 60,
          spread: 65,
          startVelocity: 30,
          gravity: 1.1,
          origin: { y: 0.7 },
        });
      }
      window.setTimeout(() => navigate(returnTo ?? "/home", { replace: true }), 900);
    } catch (error) {
      justCompletedRef.current = false;
      console.error("Error al iniciar sesión desde el onboarding:", error);
    } finally {
      setAuthLoading(false);
    }
  }

  const canContinue = step !== 1 || panelName.trim().length > 0;

  return (
    <div className="onboarding">
      <header className="onboarding__topbar">
        <span className="onboarding__brand">TheTavlo</span>
        <Link to="/home" className="onboarding__exit">
          Prefiero entrar directo
        </Link>
      </header>

      <div className="onboarding__progress">
        <div
          className="onboarding__dots"
          role="group"
          aria-label={`Paso ${step} de ${TOTAL_STEPS}`}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, index) => {
            const position = index + 1;
            return (
              <span
                key={position}
                className={[
                  "onboarding__dot",
                  position < step && "onboarding__dot--done",
                  position === step && "onboarding__dot--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            );
          })}
        </div>
        <span className="onboarding__progress-label" aria-hidden="true">
          Paso {step} de {TOTAL_STEPS}
        </span>
      </div>

      <main
        className="onboarding__stage"
        ref={stageRef}
        tabIndex={-1}
        key={step}
      >
        {step > 1 && (
          <div className="onboarding__panel-preview">
            <PanelPreview panel={panelPreview} />
          </div>
        )}

        {step === 1 && (
          <section aria-labelledby="onboarding-heading">
            <p className="onboarding__eyebrow">Tu primer panel</p>
            <h1 id="onboarding-heading" className="onboarding__title">
              ¿Qué quieres organizar?
            </h1>
            <p className="onboarding__subtitle">
              Ponle un nombre. Después elegiremos un emoji y un color para
              reconocerlo fácilmente.
            </p>
            <Input
              label="Nombre del panel"
              placeholder="Ej. Estudios, Viaje, Trabajo"
              value={panelName}
              onChange={(event) => {
                setPanelName(event.target.value);
                setFormError(undefined);
              }}
              errorMessage={formError}
              autoFocus
              required
            />
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="onboarding-heading">
            <p className="onboarding__eyebrow">Personalización</p>
            <h1 id="onboarding-heading" className="onboarding__title">
              Elige un emoji
            </h1>
            <p className="onboarding__subtitle">
              Sugerimos opciones según el nombre de tu panel. Cada emoji trae
              su propio color.
            </p>
            <div className="onboarding__emoji-carousel" role="group" aria-label="Emojis sugeridos">
              <Button
                variant="ghost"
                icon="IconArrowLeft"
                label="Anterior"
                onClick={() => selectEmoji((selectedEmojiIndex - 1 + emojiSuggestions.length) % emojiSuggestions.length)}
              />
              <span className="onboarding__emoji-count" aria-live="polite">
                {selectedEmojiIndex + 1} de {emojiSuggestions.length}
              </span>
              <Button
                variant="ghost"
                icon="IconArrowRight"
                label="Siguiente"
                onClick={() => selectEmoji((selectedEmojiIndex + 1) % emojiSuggestions.length)}
              />
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="onboarding-heading">
            <p className="onboarding__eyebrow">Revisión</p>
            <h1 id="onboarding-heading" className="onboarding__title">
              Tu panel está listo
            </h1>
            <p className="onboarding__subtitle">
              Al crear tu cuenta, añadiremos este panel a tu espacio.
            </p>
          </section>
        )}

        {step === 4 && (
          <StepAuth
            onGoogle={() => completeAuth(signInWithGoogle)}
            onGuest={() => completeAuth(signInAsGuest)}
            isLoading={isAuthLoading}
            errorMessage={state.status === "error" ? state.error : null}
            success={authSucceeded}
          />
        )}
      </main>

      {!authSucceeded && (
        <footer className="onboarding__nav">
          {step > 1 && step < 4 ? (
            <Button
              variant="ghost"
              icon="IconArrowLeft"
              label="Atrás"
              onClick={goBack}
              disabled={isAuthLoading}
            />
          ) : (
            <span aria-hidden="true" />
          )}

          <div className="onboarding__nav-actions">
            {step < 4 && (
              <Button
                variant="primary"
                icon="IconArrowRight"
                label="Continuar"
                onClick={goNext}
                disabled={!canContinue || isLoading}
              />
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
