import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Icon from "#shared/ui/atoms/icons";
import { Button } from "#components/atoms/button";
import useAnnounce from "#core/a11y/useAnnounce";
import {
  getPendingDecision,
  type DecisionAnswer,
  type RiseStory,
  type RiseStoryDecision,
} from "#features/rise/domain/rise.entity";
import type { RiseStoriesProps } from "./riseStories.types";
import { StoryCard, getStoryLabel, getStoryTone } from "./storyCard";
import "./riseStories.css";

gsap.registerPlugin(useGSAP);

// ─── Tiempos ──────────────────────────────────────────────────────────────────

/** Segundos que dura cada historia antes de avanzar sola (0 = no auto-avanza). */
const STORY_DURATION_S: Record<RiseStory["kind"], number> = {
  intro: 6,
  empty: 0,
  urgent: 8,
  task: 8,
  agenda: 9,
  workday: 7,
  outro: 0,
};

/** Pausa tras responder SÍ/NO para que se vea el resultado antes de avanzar. */
const ANSWER_ADVANCE_S = 1.2;
const HOLD_MS = 220;
const SWIPE_PX = 56;
const TAP_SLOP_PX = 10;
const WHEEL_COOLDOWN_MS = 700;

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

type Direction = 1 | -1;

export function RiseStories({
  status,
  stories,
  errorMessage,
  answerError,
  pendingDecisionId,
  onAnswer,
  onRetry,
  onClose,
}: RiseStoriesProps) {
  const announce = useAnnounce();

  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const fillRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<DecisionAnswer | null>(null);

  const lastIndex = Math.max(stories.length - 1, 0);
  const safeIndex = Math.min(index, lastIndex);
  const story: RiseStory | undefined = stories[safeIndex];
  const isReady = status === "ready" && story !== undefined;
  const pendingDecision = story ? getPendingDecision(story) : null;
  const now = new Date();

  // ─── Refs "latest" (los listeners nativos nunca leen estado viejo) ──────────
  const indexRef = useRef(safeIndex);
  indexRef.current = safeIndex;
  const directionRef = useRef<Direction>(1);
  const navLockRef = useRef(false);
  const closingRef = useRef(false);
  const userPausedRef = useRef(false);
  const progressTweenRef = useRef<gsap.core.Tween | null>(null);
  const feedbackTlRef = useRef<gsap.core.Timeline | null>(null);
  const holdRef = useRef({ active: false, held: false, x: 0, y: 0, timer: 0 });
  const wheelAtRef = useRef(0);
  const handlersRef = useRef({
    next: () => {},
    prev: () => {},
    close: () => {},
    answer: (_decision: RiseStoryDecision, _value: DecisionAnswer) => {},
  });

  // ─── Reproducción (pausa del usuario, "mantener pulsado", pestaña oculta) ───

  const syncPlayback = () => {
    const shouldPause = userPausedRef.current || holdRef.current.held || document.hidden;
    progressTweenRef.current?.paused(shouldPause);
  };

  const togglePause = () => {
    userPausedRef.current = !userPausedRef.current;
    setUserPaused(userPausedRef.current);
    syncPlayback();
  };

  // ─── Navegación ─────────────────────────────────────────────────────────────

  const goTo = (target: number, direction: Direction) => {
    if (navLockRef.current || closingRef.current) return;
    if (target < 0 || target > lastIndex || target === indexRef.current) return;

    progressTweenRef.current?.kill();
    feedbackTlRef.current?.kill();
    directionRef.current = direction;

    const card = viewportRef.current?.querySelector<HTMLElement>("[data-card]");
    const commit = () => {
      navLockRef.current = false;
      setIndex(target);
    };

    if (!card || prefersReducedMotion()) {
      commit();
      return;
    }

    // Sale la tarjeta actual; al terminar, React monta la nueva y el efecto
    // de más abajo ejecuta su entrada.
    navLockRef.current = true;
    gsap.to(card, {
      y: -direction * 48,
      opacity: 0,
      scale: 0.95,
      duration: 0.26,
      ease: "power2.in",
      onComplete: commit,
    });
  };

  const next = () => goTo(indexRef.current + 1, 1);
  const prev = () => goTo(indexRef.current - 1, -1);

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    progressTweenRef.current?.pause();
    feedbackTlRef.current?.kill();

    if (prefersReducedMotion() || !stageRef.current) {
      onClose();
      return;
    }
    gsap
      .timeline({ onComplete: onClose })
      .to(stageRef.current, { y: 32, scale: 0.97, opacity: 0, duration: 0.28, ease: "power2.in" })
      .to(backdropRef.current, { opacity: 0, duration: 0.25 }, "<");
  };

  // ─── Responder SÍ / NO ──────────────────────────────────────────────────────

  const handleAnswer = async (decision: RiseStoryDecision, value: DecisionAnswer) => {
    if (pendingAnswer !== null) return;
    setPendingAnswer(value);
    const saved = await onAnswer(decision, value);
    setPendingAnswer(null);

    const card = viewportRef.current?.querySelector<HTMLElement>("[data-card]");

    if (!saved) {
      // Error: sacudimos el bloque de decisión para llamar la atención.
      const block = card?.querySelector<HTMLElement>(".rise-decision");
      if (block && !prefersReducedMotion()) {
        gsap.fromTo(block, { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
      }
      return;
    }

    announce(value === "yes" ? "Respuesta guardada: sí" : "Respuesta guardada: no");

    // Con movimiento reducido no hay avance automático: el usuario navega a mano.
    if (prefersReducedMotion()) return;

    // La barra de progreso se llena y, al completarse, pasamos a la siguiente.
    const fill = fillRefs.current[indexRef.current];
    feedbackTlRef.current?.kill();
    feedbackTlRef.current = gsap.timeline({ onComplete: () => handlersRef.current.next() });
    if (fill) feedbackTlRef.current.to(fill, { scaleX: 1, duration: ANSWER_ADVANCE_S, ease: "none" });
    else feedbackTlRef.current.to({}, { duration: ANSWER_ADVANCE_S });
  };

  handlersRef.current = {
    next,
    prev,
    close: requestClose,
    answer: (decision, value) => {
      void handleAnswer(decision, value);
    },
  };

  // ─── Apertura del visor ─────────────────────────────────────────────────────

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(backdropRef.current, { opacity: 0, duration: 0.3, ease: "power1.out" });
      gsap.from(stageRef.current, { y: 48, scale: 0.96, opacity: 0, duration: 0.55, ease: "power3.out" });
    },
    { scope: rootRef },
  );

  // ─── Entrada de cada historia + barra de progreso ───────────────────────────

  useGSAP(
    () => {
      if (!isReady || !story) return;
      const root = rootRef.current;
      const card = root?.querySelector<HTMLElement>("[data-card]");
      if (!root || !card) return;

      const reduce = prefersReducedMotion();
      const direction = directionRef.current;
      const items = card.querySelectorAll<HTMLElement>("[data-anim]");
      const counters = card.querySelectorAll<HTMLElement>("[data-count]");
      const glow = card.querySelector<HTMLElement>("[data-glow]");

      if (!reduce) {
        const tl = gsap.timeline();
        tl.fromTo(
          card,
          { y: direction * 64, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" },
        );
        tl.from(items, { y: 22, opacity: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" }, 0.18);

        counters.forEach((el) => {
          const target = Number(el.dataset.count ?? 0);
          const counter = { value: 0 };
          el.textContent = "0";
          tl.to(
            counter,
            {
              value: target,
              duration: 0.9,
              ease: "power1.out",
              onUpdate: () => {
                el.textContent = String(Math.round(counter.value));
              },
            },
            0.3,
          );
        });

        if (glow) {
          gsap.to(glow, {
            xPercent: 14,
            yPercent: -10,
            scale: 1.18,
            duration: 6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      }

      // Barras de progreso: completas hasta aquí, vacías después.
      const fills = fillRefs.current;
      fills.forEach((el, i) => {
        if (el) gsap.set(el, { scaleX: i < safeIndex ? 1 : 0 });
      });

      progressTweenRef.current?.kill();
      progressTweenRef.current = null;

      const fill = fills[safeIndex];
      const seconds = STORY_DURATION_S[story.kind];
      // Una decisión sin responder NO avanza sola: el usuario decide cuándo.
      const autoAdvance = seconds > 0 && !reduce && getPendingDecision(story) === null;

      if (fill) {
        if (autoAdvance) {
          progressTweenRef.current = gsap.fromTo(
            fill,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: seconds,
              ease: "none",
              paused: userPausedRef.current || holdRef.current.held || document.hidden,
              onComplete: () => handlersRef.current.next(),
            },
          );
        } else if (story.kind === "outro" || story.kind === "empty" || getPendingDecision(story) === null) {
          gsap.set(fill, { scaleX: 1 });
        }
      }
    },
    { scope: rootRef, dependencies: [safeIndex, status, stories.length], revertOnUpdate: true },
  );

  // ─── Resultado de la decisión: "pop" al responder ───────────────────────────

  const resultKey =
    story && (story.kind === "task" || story.kind === "workday") && story.decision?.answered
      ? `${story.id}:${story.decision.answered}`
      : "";

  useGSAP(
    () => {
      if (!resultKey || prefersReducedMotion()) return;
      const result = rootRef.current?.querySelector<HTMLElement>("[data-result]");
      if (result) {
        gsap.fromTo(
          result,
          { scale: 0.7, opacity: 0, y: 12 },
          { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: "back.out(2)" },
        );
      }
    },
    { scope: rootRef, dependencies: [resultKey] },
  );

  // ─── Efectos de ciclo de vida ───────────────────────────────────────────────

  // Foco, bloqueo de scroll y limpieza de animaciones pendientes.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();

    const hold = holdRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(hold.timer);
      progressTweenRef.current?.kill();
      feedbackTlRef.current?.kill();
      previouslyFocused?.focus?.();
    };
  }, []);

  // Teclado: ← → ↑ ↓ navegan, Esc cierra, S / N responden la decisión visible.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const handlers = handlersRef.current;

      if (event.key === "Escape") {
        event.preventDefault();
        handlers.close();
        return;
      }

      if (event.key === "Tab") {
        const root = rootRef.current;
        if (!root) return;
        const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        const active = document.activeElement;
        if (!root.contains(active) || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        handlers.next();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        handlers.prev();
      }
    };

    const onKeyAnswer = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key !== "s" && key !== "n") return;
      const block = rootRef.current?.querySelector<HTMLElement>(".rise-decision");
      const decisionId = block?.dataset.decisionId;
      if (!decisionId || !pendingDecisionRef.current || pendingDecisionRef.current.id !== decisionId) return;
      event.preventDefault();
      handlersRef.current.answer(pendingDecisionRef.current, key === "s" ? "yes" : "no");
    };

    const onVisibility = () => syncPlayback();

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", onKeyAnswer);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keydown", onKeyAnswer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // syncPlayback solo lee refs: es seguro no re-suscribir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingDecisionRef = useRef<RiseStoryDecision | null>(null);
  pendingDecisionRef.current = pendingDecision;

  // Anuncio para lectores de pantalla al cambiar de historia.
  useEffect(() => {
    if (isReady && story) announce(`Historia ${safeIndex + 1} de ${stories.length}: ${getStoryLabel(story)}`);
    // Solo al cambiar de historia, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, isReady]);

  // ─── Gestos: tap en los bordes, swipe, mantener pulsado, rueda ──────────────

  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof HTMLElement && target.closest("button, a, input, [data-no-nav]") !== null;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isReady || isInteractiveTarget(event.target)) return;
    const hold = holdRef.current;
    hold.active = true;
    hold.held = false;
    hold.x = event.clientX;
    hold.y = event.clientY;
    window.clearTimeout(hold.timer);
    hold.timer = window.setTimeout(() => {
      hold.held = true;
      syncPlayback();
    }, HOLD_MS);
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const hold = holdRef.current;
    if (!hold.active) return;
    hold.active = false;
    window.clearTimeout(hold.timer);
    const wasHeld = hold.held;
    hold.held = false;
    syncPlayback();
    if (cancelled || wasHeld) return;

    const dx = event.clientX - hold.x;
    const dy = event.clientY - hold.y;

    if (Math.abs(dy) > SWIPE_PX && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) next();
      else prev();
      return;
    }
    if (Math.abs(dx) > SWIPE_PX) {
      if (dx < 0) next();
      else prev();
      return;
    }
    if (Math.abs(dx) <= TAP_SLOP_PX && Math.abs(dy) <= TAP_SLOP_PX) {
      const rect = event.currentTarget.getBoundingClientRect();
      const relative = (event.clientX - rect.left) / rect.width;
      if (relative < 0.33) prev();
      else next();
    }
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isReady || Math.abs(event.deltaY) < 24) return;
    const scroller = viewportRef.current?.querySelector<HTMLElement>("[data-scroll]");
    // Si la tarjeta tiene scroll propio, la rueda desplaza su contenido.
    if (scroller && scroller.scrollHeight > scroller.clientHeight + 2) return;
    const nowMs = performance.now();
    if (nowMs - wheelAtRef.current < WHEEL_COOLDOWN_MS) return;
    wheelAtRef.current = nowMs;
    if (event.deltaY > 0) next();
    else prev();
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const showPause = isReady && story && STORY_DURATION_S[story.kind] > 0 && pendingDecision === null;

  return createPortal(
    <div
      ref={rootRef}
      className="rise-stories"
      role="dialog"
      aria-modal="true"
      aria-label="Rise: tu repaso del día"
      tabIndex={-1}
    >
      <div ref={backdropRef} className="rise-stories__backdrop" onClick={requestClose} aria-hidden="true" />

      <div ref={stageRef} className="rise-stories__stage" data-tone={story ? getStoryTone(story) : "brand"}>
        <header className="rise-stories__header">
          {isReady && stories.length > 1 && (
            <ol className="rise-stories__progress" aria-hidden="true">
              {stories.map((item, i) => (
                <li key={item.id} className="rise-stories__bar">
                  <span
                    ref={(el) => {
                      fillRefs.current[i] = el;
                    }}
                    className="rise-stories__bar-fill"
                  />
                </li>
              ))}
            </ol>
          )}
          <div className="rise-stories__bar-row">
            <span className="rise-stories__brand">
              <Icon name="IconSunrise" className="" />
              Rise
            </span>
            {isReady && stories.length > 1 && (
              <span className="rise-stories__counter" aria-hidden="true">
                {safeIndex + 1} / {stories.length}
              </span>
            )}
            <div className="rise-stories__controls">
              {showPause && (
                <button
                  type="button"
                  className="rise-stories__icon-btn"
                  aria-label={userPaused ? "Reanudar historias" : "Pausar historias"}
                  onClick={togglePause}
                >
                  <Icon name={userPaused ? "IconPlayerPlay" : "IconPlayerPause"} className="" />
                </button>
              )}
              <button type="button" className="rise-stories__icon-btn" aria-label="Cerrar Rise" onClick={requestClose}>
                <Icon name="IconX" className="" />
              </button>
            </div>
          </div>
        </header>

        <div
          ref={viewportRef}
          className="rise-stories__viewport"
          onPointerDown={onPointerDown}
          onPointerUp={(event) => endPointer(event, false)}
          onPointerCancel={(event) => endPointer(event, true)}
          onPointerLeave={(event) => endPointer(event, true)}
          onWheel={onWheel}
        >
          {status === "loading" && (
            <div className="rise-card rise-card--loading" role="status" aria-live="polite">
              <div className="rise-card__content">
                <span className="rise-skeleton rise-skeleton--kicker" />
                <span className="rise-skeleton rise-skeleton--title" />
                <span className="rise-skeleton rise-skeleton--line" />
                <span className="rise-skeleton rise-skeleton--line rise-skeleton--short" />
                <span className="rise-sr">Preparando tu repaso del día…</span>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="rise-card rise-card--error" data-tone="danger">
              <div className="rise-card__content" data-scroll>
                <p className="rise-card__kicker">
                  <Icon name="IconAlertTriangle" className="" />
                  <span>Algo salió mal</span>
                </p>
                <h2 className="rise-card__title">No pudimos preparar tu repaso</h2>
                <p className="rise-card__lead" role="alert">
                  {errorMessage ?? "Inténtalo de nuevo en unos segundos."}
                </p>
                <div className="rise-card__cta" data-no-nav>
                  <Button variant="primary" size="lg" label="Reintentar" className="rise-card__cta-btn" onClick={onRetry} />
                </div>
              </div>
            </div>
          )}

          {isReady && story && (
            <article
              key={story.id}
              data-card
              className={`rise-card rise-card--${story.kind}`}
              data-tone={getStoryTone(story)}
            >
              <div className="rise-card__glow" data-glow aria-hidden="true" />
              <div className="rise-card__content" data-scroll>
                <StoryCard
                  story={story}
                  now={now}
                  pendingDecisionId={pendingDecisionId}
                  pendingAnswer={pendingAnswer}
                  answerError={answerError}
                  onAnswer={(decision, value) => void handleAnswer(decision, value)}
                  onClose={requestClose}
                />
              </div>
            </article>
          )}
        </div>

        {isReady && stories.length > 1 && (
          <>
            <button
              type="button"
              className="rise-stories__nav rise-stories__nav--prev"
              aria-label="Historia anterior"
              disabled={safeIndex === 0}
              onClick={prev}
            >
              <Icon name="IconChevronLeft" className="" />
            </button>
            <button
              type="button"
              className="rise-stories__nav rise-stories__nav--next"
              aria-label="Historia siguiente"
              disabled={safeIndex === lastIndex}
              onClick={next}
            >
              <Icon name="IconChevronRight" className="" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

RiseStories.displayName = "RiseStories";
