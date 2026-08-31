import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import useAnnounce from "#core/a11y/useAnnounce";
import { useDocumentTitle } from "#core/routing/useDocumentTitle";
import { Button } from "#components/atoms/button";
import { GOAL_OPTIONS, SPACE_COLOR_OPTIONS, SPACE_ICON_OPTIONS, suggestStarterWidget, } from "../../domain/onBoarding.entity";
import { savePendingOnboarding } from "../../infraestructure/onBoardingStorage";
import { safeReturnTo } from "#core/routing/returnTo";
import StepGoals from "./onBoardingStep/goals.step";
import StepSpace from "./onBoardingStep/space.step";
import StepStarter from "./onBoardingStep/starter.step";
import StepFirstTask from "./onBoardingStep/firstTask.step";
import StepAuth from "./onBoardingStep/auth.step";
import "./OnboardingPage.css";
/**
 * Onboarding de TheTavlo — se muestra en `/login?onBoarding` (ver el branch
 * agregado en `LoginPage.tsx`).
 *
 * Decisiones de diseño, por si alguien retoma esto después:
 *
 * 1. Objetivo primero, producto después. El paso 1 no pregunta "qué widget
 *    querés" — pregunta qué problema tiene la persona. Todo lo demás
 *    (placeholder del nombre del espacio, tarea de ejemplo, widget
 *    sugerido) se deriva de esa respuesta.
 * 2. Solo se ofrece elegir entre `task-list` y `panels-list` en el paso 3
 *    porque son los únicos widgets con `commingSoon: false` en
 *    `widgetTemplates.ts` hoy. Mostrar los otros 10 acá sería prometer algo
 *    que la app todavía no cumple.
 * 3. Carga cognitiva mínima: una sola decisión visible por paso, layout
 *    idéntico entre pasos (misma barra de progreso, mismo lugar para
 *    Atrás/Continuar), nada se auto-avanza ni desaparece solo. El paso 2
 *    (color/ícono) y el paso 4 (primera tarea) tienen valores por
 *    defecto sensatos y son opcionales — a propósito, para que "continuar
 *    sin pensar" sea siempre una opción válida.
 * 4. Accesibilidad: foco se mueve al contenido del paso en cada cambio
 *    (`stageRef`), cada paso se anuncia por `useAnnounce` para lectores de
 *    pantalla, todo es operable por teclado (son <button> nativos), los
 *    errores se describen en texto (no solo con color), y se respeta
 *    `prefers-reduced-motion` tanto en CSS como en el confetti final.
 * 5. El plan se persiste paso a paso vía `savePendingOnboarding` (ver
 *    `onboardingStorage.ts`) porque esta página está fuera de
 *    PanelsProvider/WidgetsProvider — aplicarlo de verdad pasa después,
 *    en `useOnBoardingBootstrap`, llamado desde `HomePage`.
 */
const TOTAL_STEPS = 5;
function prefersReducedMotion() {
    return (typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}
export default function OnboardingPage() {
    useDocumentTitle("Bienvenida");
    const { signInAsGuest, signInWithGoogle, state } = useAuth();
    const announce = useAnnounce();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = safeReturnTo(searchParams.get("returnTo"));
    const stageRef = useRef(null);
    const justCompletedRef = useRef(false);
    const [step, setStep] = useState(1);
    const [goals, setGoals] = useState([]);
    const [spaceName, setSpaceName] = useState("");
    const [nameError, setNameError] = useState(null);
    const [spaceColor, setSpaceColor] = useState(SPACE_COLOR_OPTIONS[0].hue);
    const [spaceIcon, setSpaceIcon] = useState(SPACE_ICON_OPTIONS[0].name);
    const [starterOverride, setStarterOverride] = useState(null);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDue, setTaskDue] = useState("week");
    const [isAuthLoading, setAuthLoading] = useState(false);
    const [authSucceeded, setAuthSucceeded] = useState(false);
    const suggestedStarter = useMemo(() => suggestStarterWidget(goals), [goals]);
    const starter = starterOverride ?? suggestedStarter;
    // Si ya hay sesión activa (alguien llegó a esta URL por error, o volvió
    // atrás en el navegador después de loguearse), no tiene sentido mostrar
    // el onboarding — lo mandamos directo a su espacio.
    useEffect(() => {
        if (state.status === "authenticated" && !justCompletedRef.current) {
            navigate(returnTo ?? "/home", { replace: true });
        }
    }, [state.status, navigate, returnTo]);
    // Foco + anuncio en cada cambio de paso: quien navega con teclado no
    // pierde su lugar, y quien usa lector de pantalla se entera del cambio
    // aunque no haya recarga de página.
    useEffect(() => {
        stageRef.current?.focus();
        announce(`Paso ${step} de ${TOTAL_STEPS}`);
    }, [step, announce]);
    const persistDraft = useCallback((firstTaskOverride) => {
        const firstTask = firstTaskOverride !== undefined
            ? firstTaskOverride
            : taskTitle.trim()
                ? { title: taskTitle.trim(), due: taskDue }
                : null;
        savePendingOnboarding({
            goals,
            spaceName: spaceName.trim(),
            spaceColor,
            spaceIcon,
            starterWidget: starter,
            firstTask,
        });
    }, [goals, spaceName, spaceColor, spaceIcon, starter, taskTitle, taskDue]);
    function toggleGoal(goal) {
        setGoals((prev) => {
            const option = GOAL_OPTIONS.find((g) => g.value === goal);
            if (option?.exclusive) {
                return prev.includes(goal) ? [] : [goal];
            }
            const withoutExclusive = prev.filter((g) => !GOAL_OPTIONS.find((opt) => opt.value === g)?.exclusive);
            return withoutExclusive.includes(goal)
                ? withoutExclusive.filter((g) => g !== goal)
                : [...withoutExclusive, goal];
        });
    }
    function goNext() {
        if (step === 2 && !spaceName.trim()) {
            setNameError("Ponele un nombre — podés cambiarlo cuando quieras.");
            return;
        }
        setNameError(null);
        persistDraft();
        setStep((current) => Math.min(TOTAL_STEPS, current + 1));
    }
    function goBack() {
        setStep((current) => Math.max(1, current - 1));
    }
    function skipFirstTask() {
        persistDraft(null);
        setStep(5);
    }
    async function completeAuth(action) {
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
        }
        catch (error) {
            justCompletedRef.current = false;
            console.error("Error al iniciar sesión desde el onboarding:", error);
        }
        finally {
            setAuthLoading(false);
        }
    }
    const canContinue = step !== 1 || goals.length > 0;
    return (_jsxs("div", { className: "onboarding", children: [_jsxs("header", { className: "onboarding__topbar", children: [_jsx("span", { className: "onboarding__brand", children: "TheTavlo" }), _jsx(Link, { to: "/home", className: "onboarding__exit", children: "Prefiero entrar directo" })] }), _jsxs("div", { className: "onboarding__progress", children: [_jsx("div", { className: "onboarding__dots", role: "group", "aria-label": `Paso ${step} de ${TOTAL_STEPS}`, children: Array.from({ length: TOTAL_STEPS }, (_, index) => {
                            const position = index + 1;
                            return (_jsx("span", { className: [
                                    "onboarding__dot",
                                    position < step && "onboarding__dot--done",
                                    position === step && "onboarding__dot--active",
                                ]
                                    .filter(Boolean)
                                    .join(" ") }, position));
                        }) }), _jsxs("span", { className: "onboarding__progress-label", "aria-hidden": "true", children: ["Paso ", step, " de ", TOTAL_STEPS] })] }), _jsxs("main", { className: "onboarding__stage", ref: stageRef, tabIndex: -1, children: [step === 1 && _jsx(StepGoals, { goals: goals, onToggle: toggleGoal }), step === 2 && (_jsx(StepSpace, { goals: goals, spaceName: spaceName, onNameChange: (value) => {
                            setSpaceName(value);
                            if (nameError)
                                setNameError(null);
                        }, nameError: nameError, spaceColor: spaceColor, onColorChange: setSpaceColor, spaceIcon: spaceIcon, onIconChange: setSpaceIcon })), step === 3 && (_jsx(StepStarter, { starter: starter, onSelect: setStarterOverride })), step === 4 && (_jsx(StepFirstTask, { goals: goals, title: taskTitle, onTitleChange: setTaskTitle, due: taskDue, onDueChange: setTaskDue })), step === 5 && (_jsx(StepAuth, { onGoogle: () => completeAuth(signInWithGoogle), onGuest: () => completeAuth(signInAsGuest), isLoading: isAuthLoading, errorMessage: state.status === "error" ? state.error : null, success: authSucceeded }))] }, step), !authSucceeded && (_jsxs("footer", { className: "onboarding__nav", children: [step > 1 && step < 5 ? (_jsx(Button, { variant: "ghost", icon: "IconArrowLeft", label: "Atr\u00E1s", onClick: goBack, disabled: isAuthLoading })) : (_jsx("span", { "aria-hidden": "true" })), _jsxs("div", { className: "onboarding__nav-actions", children: [step === 4 && (_jsx(Button, { variant: "ghost", label: "Saltear por ahora", onClick: skipFirstTask })), step < 5 && (_jsx(Button, { variant: "primary", icon: "IconArrowRight", label: "Continuar", onClick: goNext, disabled: !canContinue }))] })] }))] }));
}
