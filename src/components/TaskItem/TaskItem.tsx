import { useState } from "react";
import { updateTask, deleteTask } from "../../services/tasks";
import type { Task } from "../../types/task";

export function TaskItem({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  async function handleToggleComplete() {
    await updateTask(task.id, { completed: !task.completed });
  }

  async function handleDelete() {
    await deleteTask(task.id);
  }

  async function handleSaveEdit() {
    if (!title.trim()) return;
    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
    });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setTitle(task.title);
    setDescription(task.description);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleSaveEdit}>Guardar</button>
        <button onClick={handleCancelEdit}>Cancelar</button>
      </li>
    );
  }

  return (
    <li>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggleComplete}
      />
      <span>{task.title}</span>
      {task.description && <p>{task.description}</p>}
      <button onClick={() => setIsEditing(true)}>Editar</button>
      <button onClick={handleDelete}>Eliminar</button>
    </li>
  );
}
