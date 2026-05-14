import { useState, type SyntheticEvent } from "react";
import { DocumentReference, Timestamp } from "firebase/firestore";
import {
  TaskProgress,
  TaskPhase,
  type CreateAnyTaskDTO,
  type CreateNodeTaskDTO,
  type CreateTaskDTO,
} from "#features/task/domain/task.entity";

import { Modal } from "#components/molecules/modal";
import useTasks from "#features/task/presentation/hooks/useTask";
import { Accordion } from "#components/molecules/acordion/acordion";
import { Button } from "#components/atoms/button";

import "./addTask.css";
import type { AccordionItem } from "#components/molecules/acordion/acordion.types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormErrors {
  title?: string;
  progress?: string;
  phase?: string;
  endAt?: string;
}

interface AddTaskFormProps {
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTimestamp(value: string): Timestamp {
  return Timestamp.fromDate(new Date(value));
}

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toAccordionItem(item: CreateAnyTaskDTO, key: string): AccordionItem {
  return { id: key, title: item.title ? item.title : "", content: <>
        <div>
        <Field label="Título">
          <input
            className="add-task__input"
            type="text"
            value={item.title}
            onChange={(e) =>
              handleSubtaskTitle(i, e.target.value)
            }
            placeholder={`Título de subtarea ${i + 1}`}
          />
        </Field>

        <div style={{ marginTop: 12 }}>
          <Button
            type="button"
            variant="ghost"
            icon="IconX"
            label="Eliminar"
            onClick={() => handleRemoveSubtask(i)}
          />
        </div>
      </div>
</>}
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AddTask({ onClose }: AddTaskFormProps) {
  // Form state
  const initialStateTask: CreateTaskDTO = {
    title: "",
    phase: TaskPhase.UNSCHEDULED,
    progress: TaskProgress.NOTSTARTED,
    endAt: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const [tasks, setTasks] = useState<CreateAnyTaskDTO[]>([initialStateTask]);
  const [accordionItems, setAccordionItems] = useState([]);

  // Subtask state
  const [hasSubtasks, setHasSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<CreateTaskDTO[]>([]);

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // useContext
  const { createTask } = useTasks();

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next: FormErrors = {};

    if (!title.trim()) next.title = "El título es obligatorio";
    if (!progress) next.progress = "Selecciona un progreso";
    if (!endAt) next.endAt = "La fecha de cierre es obligatoria";

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  // ── Subtasks ───────────────────────────────────────────────────────────────

  function handleToggleSubtasks() {
    setHasSubtasks((prev) => !prev);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const now = Timestamp.now();

      const taskMap: CreateAnyTaskDTO[] = [];

      if (hasSubtasks) {
        const nodeTaskDTO: CreateNodeTaskDTO = {
          subTaskId: new Map<number, DocumentReference>(),
          title: title.trim(),
          ...(openAt && { openAt: toTimestamp(openAt) }),
          endAt: toTimestamp(endAt),
          createdAt: now,
          updatedAt: now,
        };

        for (const element of subtasks) {
          const taskDTO: CreateTaskDTO = {
            title: element.title.trim(),
            ...(element.openAt && { openAt: element.openAt }),
            phase: TaskPhase.UNSCHEDULED,
            progress: TaskProgress.NOTSTARTED,
            endAt: element.endAt,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt,
          };

          taskMap.push(taskDTO);
        }

        taskMap.push(nodeTaskDTO);
      } else {
        const taskDTO: CreateTaskDTO = {
          title: title.trim(),
          phase: TaskPhase.UNSCHEDULED,
          progress: TaskProgress.NOTSTARTED,
          ...(openAt && { openAt: toTimestamp(openAt) }),
          endAt: toTimestamp(endAt),
          createdAt: now,
          updatedAt: now,
        };

        taskMap.push(taskDTO);
      }

      await createTask(taskMap);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const minDate = toLocalDatetimeString(new Date());

  return (
    <>
      <Modal.Header onClose={onClose}>
        <div className="add-task__header">
          <div className="add-task__header-icon">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>

          <div>
            <p className="add-task__header-title">Nueva tarea</p>

            <p className="add-task__header-sub">
              Los campos con * son obligatorios
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="add-task__card"
        >
          <div className="add-task__body">
            {/* Title */}
            <Field label="Título" required error={errors.title}>
              <input
                className={`add-task__input ${
                  errors.title ? "add-task__input--error" : ""
                }`}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);

                  setErrors((p) => ({
                    ...p,
                    title: undefined,
                  }));
                }}
                placeholder="Ej. Diseñar pantalla de onboarding"
                aria-required="true"
                aria-invalid={!!errors.title}
              />
            </Field>

            {/* Dates */}
            <div className="add-task__row">
              <Field label="Abre el">
                <input
                  className="add-task__input"
                  type="datetime-local"
                  value={openAt}
                  min={minDate}
                  onChange={(e) => setOpenAt(e.target.value)}
                />
              </Field>

              <Field
                label="Cierra el"
                required
                error={errors.endAt}
              >
                <input
                  className={`add-task__input ${
                    errors.endAt ? "add-task__input--error" : ""
                  }`}
                  type="datetime-local"
                  value={endAt}
                  min={openAt || minDate}
                  onChange={(e) => {
                    setEndAt(e.target.value);

                    setErrors((p) => ({
                      ...p,
                      endAt: undefined,
                    }));
                  }}
                  aria-required="true"
                  aria-invalid={!!errors.endAt}
                />
              </Field>
            </div>

            {/* Progress */}
            {!hasSubtasks && (
              <div className="add-task__row">
                <Field
                  label="Progreso"
                  required
                  error={errors.progress}
                >
                  <select
                    className={`add-task__input add-task__select ${
                      errors.progress
                        ? "add-task__input--error"
                        : ""
                    }`}
                    value={progress}
                    onChange={(e) => {
                      setProgress(e.target.value as TaskProgress);

                      setErrors((p) => ({
                        ...p,
                        progress: undefined,
                      }));
                    }}
                    aria-required="true"
                    aria-invalid={!!errors.progress}
                  >
                    <option value="">Seleccionar...</option>

                    <option value={TaskProgress.NOTSTARTED}>
                      Not started
                    </option>

                    <option value={TaskProgress.INPROGRESS}>
                      In progress
                    </option>

                    <option value={TaskProgress.SUBMITTED}>
                      Submitted
                    </option>
                  </select>
                </Field>
              </div>
            )}

            {/* Subtasks */}
            {hasSubtasks && (
              <div className="add-task__subtask-section">
                <SubTaskItems
                  subtasks={subtasks}
                  setSubtasks={setSubtasks}
                />
              </div>
            )}

            {/* Divider */}
            <div
              className="add-task__divider"
              role="separator"
            />

            {/* Section */}
            <div className="add-task__section-label">
              Subtareas
            </div>

            <Button
              type="button"
              label="Crear una subTarea"
              icon="IconAdd"
              onClick={handleToggleSubtasks}
            />
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <div className="add-task__footer">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="add-task__btn-ghost"
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="add-task__btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creando..." : "Crear tarea"}
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
          <span
            className="field__required"
            aria-hidden="true"
          >
            {" "}
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

      {hint && !error && (
        <p className="field__hint">{hint}</p>
      )}
    </div>
  );
}

// ─── Subtasks ────────────────────────────────────────────────────────────────

interface SubTaskItemsProps {
  subtasks: CreateTaskDTO[];
  setSubtasks: React.Dispatch<
    React.SetStateAction<CreateTaskDTO[]>
  >;
}

function SubTaskItems({
  subtasks,
  setSubtasks,
}: SubTaskItemsProps) {
  function handleAddSubtask() {
    const task: CreateTaskDTO = {
      title: "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      endAt: Timestamp.now(),
      phase: TaskPhase.UNSCHEDULED,
      progress: TaskProgress.NOTSTARTED,
    };

    setSubtasks((prev) => [...prev, task]);
  }

  function handleRemoveSubtask(index: number) {
    setSubtasks((prev) =>
      prev.filter((_, i) => i !== index),
    );
  }

  function handleSubtaskTitle(
    index: number,
    value: string,
  ) {
    setSubtasks((prev) =>
      prev.map((task, i) =>
        i === index
          ? {
              ...task,
              title: value,
            }
          : task,
      ),
    );
  }

  const accordionItems = subtasks.map((task, i) => ({
    id: String(i),

    title: `Tarea ${i + 1}`,

    content: (<><div></div></>),
  }));

  return (
    <>
      <Accordion items={accordionItems} />

      <button
        type="button"
        onClick={handleAddSubtask}
        className="add-task__btn-add"
      >
        + Añadir subtarea
      </button>
    </>
  );
}