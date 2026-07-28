import { useState, type FormEvent } from "react";
import { createTask } from "../../services/tasks";
import { useAuth } from "../../hooks/useAuth";

export function TaskForm() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      await createTask(user.uid, title.trim(), description.trim());
      setTitle("");
      setDescription("");
    } catch {
      setError("No se pudo crear la tarea. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Título de la tarea"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <p>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Agregando..." : "Agregar tarea"}
      </button>
    </form>
  );
}
