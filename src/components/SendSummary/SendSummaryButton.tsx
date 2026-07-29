import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import { Button } from "../ui/Button/Button";
import { formatDateDisplay } from "../../utils/date";
import "./SendSummary.css";

type Status = "idle" | "loading" | "success" | "error";

const TOAST_DURATION_MS = 4000;

export function SendSummaryButton() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [status, setStatus] = useState<Status>("idle");

  // El toast se cierra solo a los pocos segundos, para no dejar un mensaje
  // flotando indefinidamente sobre la pantalla.
  useEffect(() => {
    if (status !== "success" && status !== "error") return;
    const timer = setTimeout(() => setStatus("idle"), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [status]);

  async function handleSendSummary() {
    if (!user?.email) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/send-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          tasks: tasks.map((t) => ({
            title: t.title,
            completed: t.completed,
            priority: t.priority,
            // Se formatea acá, en el navegador del usuario, para que la
            // fecha/hora se calcule en SU zona horaria. El servidor de
            // Vercel corre en UTC y no tiene forma de saberlo.
            dueDateLabel: t.dueDate ? formatDateDisplay(t.dueDate) : undefined,
            frequency: t.frequency,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Falló el envío");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="send-summary">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleSendSummary}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Enviando..." : "Enviar resumen por correo"}
      </Button>

      {status === "success" && (
        <p className="toast toast-success" role="status">
          Resumen enviado a {user?.email}.
        </p>
      )}
      {status === "error" && (
        <p className="toast toast-error" role="status">
          No se pudo enviar el resumen. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}
