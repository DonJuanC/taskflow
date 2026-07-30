import { useState, type FormEvent } from "react";
import { createTask } from "../../services/tasks";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../ui/Input/Input";
import { Textarea } from "../ui/Textarea/Textarea";
import { Button } from "../ui/Button/Button";
import { PriorityPicker, type Priority } from "../ui/PriorityPicker/PriorityPicker";
import {
  FrequencyPicker,
  type Frequency,
} from "../ui/FrequencyPicker/FrequencyPicker";
import { parseDateInput } from "../../utils/date";
import "./TaskForm.css";

export function TaskForm() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [frequency, setFrequency] = useState<Frequency | "">("");
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
      await createTask(
        user.uid,
        title.trim(),
        description.trim(),
        parseDateInput(dueDate),
        priority || undefined,
        frequency || undefined,
      );
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("");
      setFrequency("");
    } catch {
      setError("No se pudo crear la tarea. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="task-form" noValidate>
      <div className="task-form-row task-form-row-main">
        <Input
          type="text"
          label="Título"
          placeholder="Título de la tarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          label="Descripción"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="task-form-row task-form-row-meta">
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

      <div className="task-form-row">
        <div className="field">
          <span className="field-label">Frecuencia</span>
          <FrequencyPicker value={frequency} onChange={setFrequency} />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Agregando..." : "Agregar tarea"}
      </Button>
    </form>
  );
}
