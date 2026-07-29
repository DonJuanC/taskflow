import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useTasks } from "../../hooks/useTasks";
import { reorderTasks } from "../../services/tasks";
import { TaskItem } from "../TaskItem/TaskItem";
import type { Task } from "../../types/task";
import "./TaskList.css";

type Filter = "all" | "pending" | "completed";

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    // Guardado defensivo: createdAt debería venir siempre resuelto desde
    // useTasks, pero si algún dato viejo o corrupto no lo trae, mejor
    // tratarlo como "0" que reventar el render de toda la lista.
    const timeA = a.createdAt?.getTime() ?? 0;
    const timeB = b.createdAt?.getTime() ?? 0;
    return timeB - timeA;
  });
}

export function TaskList() {
  const { tasks, loading, error } = useTasks();
  const [filter, setFilter] = useState<Filter>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (loading) {
    return (
      <div className="task-list-skeleton">
        <p className="task-list-message">Cargando tareas...</p>
        <div className="skeleton-item" />
        <div className="skeleton-item" />
        <div className="skeleton-item" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="task-list-message">
        Ocurrió un error al cargar las tareas: {error}
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="task-list-message">
        No tienes tareas todavía. ¡Agrega la primera!
      </p>
    );
  }

  const sortedTasks = sortTasks(tasks);
  const visibleTasks = sortedTasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });
  const isReorderable = filter === "all";

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
    const newIndex = sortedTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortedTasks, oldIndex, newIndex);
    await reorderTasks(reordered.map((t) => t.id));
  }

  const list = (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} sortable={isReorderable} />
      ))}
    </ul>
  );

  return (
    <div className="task-list-wrapper">
      <div className="task-filters" role="group" aria-label="Filtrar tareas">
        <FilterButton
          label="Todas"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          label="Pendientes"
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
        />
        <FilterButton
          label="Completadas"
          active={filter === "completed"}
          onClick={() => setFilter("completed")}
        />
      </div>

      {visibleTasks.length === 0 ? (
        <p className="task-list-message">
          {filter === "pending"
            ? "No tienes tareas pendientes."
            : "No tienes tareas completadas."}
        </p>
      ) : isReorderable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {list}
          </SortableContext>
        </DndContext>
      ) : (
        list
      )}
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`task-filter${active ? " task-filter-active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
