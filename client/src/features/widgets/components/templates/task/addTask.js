import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { DocumentReference, Timestamp } from "firebase/firestore";
import { TaskProgress, TaskPhase } from "#features/task/domain/task.entity";
import { Modal } from "#components/molecules/modal";
import useTasks from "#features/task/presentation/hooks/useTask";
import { Accordion } from "#components/molecules/acordion/acordion";
import { Button } from "#components/atoms/button";
import "./addTask.css";
// ─── Helpers ─────────────────────────────────────────────────────────────────
function toTimestamp(value) {
    return Timestamp.fromDate(new Date(value));
}
function toLocalDatetimeString(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
// ─── Component ───────────────────────────────────────────────────────────────
export function AddTask({ onClose }) {
    // Field States (Faltaban estas declaraciones)
    const [title, setTitle] = useState("");
    const [openAt, setOpenAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [progress, setProgress] = useState("");
    // Subtask state
    const [hasSubtasks, setHasSubtasks] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    // UI state
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    // useContext
    const { createTask } = useTasks();
    // ── Validation ─────────────────────────────────────────────────────────────
    function validate() {
        const next = {};
        if (!title.trim())
            next.title = "El título es obligatorio";
        if (!hasSubtasks && !progress)
            next.progress = "Selecciona un progreso";
        if (!endAt)
            next.endAt = "La fecha de cierre es obligatoria";
        setErrors(next);
        return Object.keys(next).length === 0;
    }
    // ── Subtasks ───────────────────────────────────────────────────────────────
    function handleToggleSubtasks() {
        setHasSubtasks((prev) => !prev);
    }
    // ── Submit ─────────────────────────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate())
            return;
        setIsLoading(true);
        try {
            const now = Timestamp.now();
            const taskMap = [];
            if (hasSubtasks) {
                const nodeTaskDTO = {
                    subTaskId: new Map(),
                    title: title.trim(),
                    openAt: toTimestamp(openAt) || null,
                    endAt: toTimestamp(endAt),
                    createdAt: now,
                    updatedAt: now,
                };
                for (const element of subtasks) {
                    const taskDTO = {
                        title: element.title.trim(),
                        phase: TaskPhase.UNSCHEDULED,
                        progress: TaskProgress.NOTSTARTED,
                        submission: null,
                        openAt: element.openAt,
                        endAt: element.endAt,
                        createdAt: element.createdAt,
                        updatedAt: element.updatedAt,
                    };
                    taskMap.push(taskDTO);
                }
                taskMap.push(nodeTaskDTO);
            }
            else {
                const taskDTO = {
                    title: title.trim(),
                    phase: TaskPhase.UNSCHEDULED,
                    progress: progress,
                    submission: null,
                    openAt: toTimestamp(openAt) || null,
                    endAt: toTimestamp(endAt),
                    createdAt: now,
                    updatedAt: now,
                };
                taskMap.push(taskDTO);
            }
            await createTask(taskMap);
            onClose(); // Es buena práctica cerrar el modal al tener éxito
        }
        finally {
            setIsLoading(false);
        }
    }
    // ── Render ─────────────────────────────────────────────────────────────────
    const minDate = toLocalDatetimeString(new Date());
    return (_jsxs(_Fragment, { children: [_jsx(Modal.Header, { onClose: onClose, title: "Nueva tarea", icon: "IconSquareRoundedCheck" }), _jsx(Modal.Body, { children: _jsx("form", { onSubmit: handleSubmit, noValidate: true, className: "add-task__card", children: _jsxs("div", { className: "add-task__body", children: [_jsx(Field, { label: "T\u00EDtulo", required: true, error: errors.title, children: _jsx("input", { className: `add-task__input ${errors.title ? "add-task__input--error" : ""}`, type: "text", value: title, onChange: (e) => {
                                        setTitle(e.target.value);
                                        setErrors((p) => ({
                                            ...p,
                                            title: undefined,
                                        }));
                                    }, placeholder: "Ej. Dise\u00F1ar pantalla de onBoarding", "aria-required": "true", "aria-invalid": !!errors.title }) }), _jsxs("div", { className: "add-task__row", children: [_jsx(Field, { label: "Abre el", children: _jsx("input", { className: "add-task__input", type: "datetime-local", value: openAt, min: minDate, onChange: (e) => setOpenAt(e.target.value) }) }), _jsx(Field, { label: "Cierra el", required: true, error: errors.endAt, children: _jsx("input", { className: `add-task__input ${errors.endAt ? "add-task__input--error" : ""}`, type: "datetime-local", value: endAt, min: openAt || minDate, onChange: (e) => {
                                                setEndAt(e.target.value);
                                                setErrors((p) => ({
                                                    ...p,
                                                    endAt: undefined,
                                                }));
                                            }, "aria-required": "true", "aria-invalid": !!errors.endAt }) })] }), !hasSubtasks && (_jsx("div", { className: "add-task__row", children: _jsx(Field, { label: "Progreso", required: true, error: errors.progress, children: _jsxs("select", { className: `add-task__input add-task__select ${errors.progress ? "add-task__input--error" : ""}`, value: progress, onChange: (e) => {
                                            setProgress(e.target.value);
                                            setErrors((p) => ({
                                                ...p,
                                                progress: undefined,
                                            }));
                                        }, "aria-required": "true", "aria-invalid": !!errors.progress, children: [_jsx("option", { value: "", children: "Seleccionar..." }), _jsx("option", { value: TaskProgress.NOTSTARTED, children: "Not started" }), _jsx("option", { value: TaskProgress.INPROGRESS, children: "In progress" }), _jsx("option", { value: TaskProgress.SUBMITTED, children: "Submitted" })] }) }) })), hasSubtasks && (_jsx("div", { className: "add-task__subtask-section", children: _jsx(SubTaskItems, { subtasks: subtasks, setSubtasks: setSubtasks }) })), _jsx("div", { className: "add-task__divider", role: "separator" }), _jsx("div", { className: "add-task__section-label", children: "Subtareas" }), _jsx(Button, { type: "button", label: hasSubtasks ? "Quitar subtareas" : "Crear una subTarea", icon: "IconAdd", onClick: handleToggleSubtasks })] }) }) }), _jsx(Modal.Footer, { children: _jsxs("div", { className: "add-task__footer", children: [onClose && (_jsx("button", { type: "button", onClick: onClose, className: "add-task__btn-ghost", disabled: isLoading, children: "Cancelar" })), _jsx("button", { type: "submit", onClick: (e) => {
                                e.preventDefault();
                                handleSubmit(e);
                            }, className: "add-task__btn-primary", disabled: isLoading, formTarget: "add-task-form", children: isLoading ? "Creando..." : "Crear tarea" })] }) })] }));
}
// ─── Field ───────────────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children, }) {
    return (_jsxs("div", { className: "field", children: [_jsxs("label", { className: "field__label", children: [label, required && (_jsxs("span", { className: "field__required", "aria-hidden": "true", children: [" ", "*"] }))] }), children, error && (_jsx("p", { className: "field__error", role: "alert", children: error })), hint && !error && _jsx("p", { className: "field__hint", children: hint })] }));
}
function SubTaskItems({ subtasks, setSubtasks }) {
    function handleAddSubtask() {
        const task = {
            title: "",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            openAt: null,
            endAt: Timestamp.now(),
            phase: TaskPhase.UNSCHEDULED,
            progress: TaskProgress.NOTSTARTED,
            submission: null,
        };
        setSubtasks((prev) => [...prev, task]);
    }
    function handleRemoveSubtask(index) {
        setSubtasks((prev) => prev.filter((_, i) => i !== index));
    }
    function handleSubtaskTitle(index, value) {
        setSubtasks((prev) => prev.map((task, i) => i === index
            ? {
                ...task,
                title: value,
            }
            : task));
    }
    // Movimos el contenido problemático de `toAccordionItem` aquí dentro
    const accordionItems = subtasks.map((item, i) => ({
        id: String(i),
        title: item.title ? item.title : `Nueva subtarea ${i + 1}`,
        content: (_jsxs("div", { children: [_jsx(Field, { label: "T\u00EDtulo", children: _jsx("input", { className: "add-task__input", type: "text", value: item.title, onChange: (e) => handleSubtaskTitle(i, e.target.value), placeholder: `Título de subtarea ${i + 1}` }) }), _jsx("div", { style: { marginTop: 12 }, children: _jsx(Button, { type: "button", variant: "ghost", icon: "IconX", label: "Eliminar", onClick: () => handleRemoveSubtask(i) }) })] })),
    }));
    return (_jsxs(_Fragment, { children: [_jsx(Accordion, { items: accordionItems }), _jsx("button", { type: "button", onClick: handleAddSubtask, className: "add-task__btn-add", children: "+ A\u00F1adir subtarea" })] }));
}
