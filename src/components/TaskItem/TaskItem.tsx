import { useState, type KeyboardEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateTask, deleteTask } from "../../services/tasks";
import type { Task } from "../../types/task";
import { Input } from "../ui/Input/Input";
import { Button } from "../ui/Button/Button";
import {
  PriorityPicker,
  PRIORITY_LABELS,
  type Priority,
} from "../ui/PriorityPicker/PriorityPicker";
import {
  FrequencyPicker,
  FREQUENCY_LABELS,
  type Frequency,
} from "../ui/FrequencyPicker/FrequencyPicker";
import {
  parseDateInput,
  formatDateInput,
  formatDateDisplay,
} from "../../utils/date";
import "./TaskItem.css";

export function TaskItem({
  task,
  sortable = true,
}: {
  task: Task;
  sortable?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(formatDateInput(task.dueDate));
  const [priority, setPriority] = useState<Priority | "">(
    task.priority ?? "",
  );
  const [frequency, setFrequency] = useState<Frequency | "">(
    task.frequency ?? "",
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const wrapperStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function handleToggleComplete() {
    await updateTask(task.id, { completed: !task.completed });
  }

  async function handleDelete() {
    await deleteTask(task.id);
  }

  async function handleSaveEdit() {
    if (!title.trim()) return;

    // Se manda explícitamente `null` cuando el campo quedó vacío, para que
    // updateTask lo borre en Firestore en vez de dejar el valor viejo (si
    // solo se omitiera la clave, el campo nunca se actualizaría).
    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? parseDateInput(dueDate) : null,
      priority: priority || null,
      frequency: frequency || null,
    });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(formatDateInput(task.dueDate));
    setPriority(task.priority ?? "");
    setFrequency(task.frequency ?? "");
    setIsEditing(false);
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  }

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={wrapperStyle} className="task-item-wrapper">
        <div className="task-item task-item-editing">
          <div className="task-edit-form">
            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleEditKeyDown}
              autoFocus
            />
            <Input
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleEditKeyDown}
            />

            <div className="task-edit-row">
              <Input
                type="datetime-local"
                label="Fecha y hora"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <div className="field">
                <span className="field-label">Prioridad</span>
                <PriorityPicker value={priority} onChange={setPriority} />
              </div>
            </div>

            <div className="field">
              <span className="field-label">Frecuencia</span>
              <FrequencyPicker value={frequency} onChange={setFrequency} />
            </div>

            <div className="task-edit-actions">
              <Button size="sm" onClick={handleSaveEdit}>
                Guardar
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li ref={setNodeRef} style={wrapperStyle} className="task-item-wrapper">
      <div
        className={`task-item${task.completed ? " task-item-done" : ""}${
          isDragging ? " task-item-dragging" : ""
        }`}
      >
        <button
          type="button"
          className="task-drag-handle"
          aria-label="Reordenar tarea"
          disabled={!sortable}
          title={
            sortable
              ? "Arrastra para reordenar"
              : "Muestra 'Todas' para reordenar"
          }
          {...(sortable ? attributes : {})}
          {...(sortable ? listeners : {})}
        >
          <GripIcon />
        </button>

        <label className="task-checkbox">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
          />
          <span className="task-checkbox-box" aria-hidden="true" />
        </label>

        <div className="task-item-content">
          <span className="task-item-title">{task.title}</span>
          {task.description && (
            <p className="task-item-description">{task.description}</p>
          )}
          {(task.dueDate || task.priority || task.frequency) && (
            <div className="task-item-meta">
              {task.dueDate && (
                <span className="task-due-date">
                  {formatDateDisplay(task.dueDate)}
                </span>
              )}
              {task.priority && (
                <span
                  className={`task-priority task-priority-${task.priority}`}
                >
                  {PRIORITY_LABELS[task.priority]}
                </span>
              )}
              {task.frequency && (
                <span className="task-frequency">
                  {FREQUENCY_LABELS[task.frequency]}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="task-item-actions">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </li>
  );
}

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}
