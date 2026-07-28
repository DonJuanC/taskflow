import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";

type Status = "idle" | "loading" | "success" | "error";

export function SendSummaryButton() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [status, setStatus] = useState<Status>("idle");

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
    <div>
      <button onClick={handleSendSummary} disabled={status === "loading"}>
        {status === "loading" ? "Enviando..." : "Enviar resumen por correo"}
      </button>

      {status === "success" && <p>Resumen enviado a {user?.email}.</p>}
      {status === "error" && (
        <p>No se pudo enviar el resumen. Intenta de nuevo.</p>
      )}
    </div>
  );
}
