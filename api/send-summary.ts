import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

type Priority = "low" | "medium" | "high";
type Frequency = "daily" | "weekly" | "monthly";

interface TaskSummaryInput {
  title: string;
  completed: boolean;
  priority?: Priority;
  // Ya viene formateada desde el cliente (ej. "15 ago, 14:00"), no como
  // ISO crudo: el navegador del usuario conoce su propia zona horaria,
  // el servidor de Vercel no. Formatear acá reabriría el mismo bug de
  // corrimiento de horas que ya corregimos en utils/date.ts.
  dueDateLabel?: string;
  frequency?: Frequency;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  low: { bg: "#dcfce7", text: "#15803d" },
  medium: { bg: "#fef3c7", text: "#b45309" },
  high: { bg: "#fee2e2", text: "#b91c1c" },
};

const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Diaria",
  weekly: "Semanal",
  monthly: "Mensual",
};

// Los títulos de tarea vienen del usuario: hay que escapar antes de
// interpolarlos en el HTML del correo (si no, un título como "<b>hola</b>"
// se renderiza como HTML en el cliente de correo).
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildTextBody(tasks: TaskSummaryInput[]): string {
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;

  const lines = [
    `Resumen de tus tareas en TaskFlow`,
    ``,
    `Total: ${tasks.length}`,
    `Completadas: ${completed}`,
    `Pendientes: ${pending}`,
    ``,
  ];

  if (tasks.length === 0) {
    lines.push("No tienes tareas registradas todavía.");
  } else {
    for (const t of tasks) {
      const meta = [
        t.priority && `prioridad ${PRIORITY_LABELS[t.priority]}`,
        t.frequency && `frecuencia ${FREQUENCY_LABELS[t.frequency]}`,
        t.dueDateLabel && `vence ${t.dueDateLabel}`,
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(
        `${t.completed ? "[x]" : "[ ]"} ${t.title}${meta ? ` (${meta})` : ""}`,
      );
    }
  }

  return lines.join("\n");
}

function buildTaskRowHtml(t: TaskSummaryInput): string {
  const titleColor = t.completed ? "#a1a1aa" : "#18181b";
  const titleDecoration = t.completed ? "text-decoration:line-through;" : "";
  const checkboxStyle = t.completed
    ? "background-color:#6d28d9;border:1px solid #6d28d9;"
    : "background-color:#ffffff;border:1px solid #d4d4d8;";

  const badges: string[] = [];
  if (t.priority) {
    const colors = PRIORITY_COLORS[t.priority];
    badges.push(
      `<span style="display:inline-block;margin-top:4px;margin-right:6px;padding:2px 8px;border-radius:999px;background-color:${colors.bg};color:${colors.text};font-size:11px;font-weight:600;">${PRIORITY_LABELS[t.priority]}</span>`,
    );
  }
  if (t.frequency) {
    badges.push(
      `<span style="display:inline-block;margin-top:4px;margin-right:6px;padding:2px 8px;border-radius:999px;background-color:#f4f4f5;color:#52525b;font-size:11px;font-weight:600;">${FREQUENCY_LABELS[t.frequency]}</span>`,
    );
  }
  if (t.dueDateLabel) {
    badges.push(
      `<span style="display:inline-block;margin-top:4px;font-size:11px;color:#a1a1aa;">${escapeHtml(t.dueDateLabel)}</span>`,
    );
  }

  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="22" style="vertical-align:top;padding-top:2px;">
              <span style="display:inline-block;width:14px;height:14px;border-radius:4px;${checkboxStyle}"></span>
            </td>
            <td style="vertical-align:top;">
              <span style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:${titleColor};${titleDecoration}">${escapeHtml(t.title)}</span>
              <div>${badges.join(" ")}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function buildHtmlBody(tasks: TaskSummaryInput[]): string {
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;

  const taskRows = tasks.length
    ? tasks.map(buildTaskRowHtml).join("")
    : `<tr><td style="padding:16px 0;text-align:center;font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#a1a1aa;">No tienes tareas registradas todavía.</td></tr>`;

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#fafafa;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
            <tr>
              <td style="background-color:#6d28d9;padding:20px 24px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;">TaskFlow</span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 16px;font-size:15px;color:#18181b;">Este es el resumen de tus tareas.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  <tr>
                    <td width="33%" style="text-align:center;padding:10px 4px;background-color:#f4f4f5;border-radius:8px 0 0 8px;">
                      <div style="font-size:20px;font-weight:700;color:#18181b;">${tasks.length}</div>
                      <div style="font-size:11px;color:#71717a;">TOTAL</div>
                    </td>
                    <td width="33%" style="text-align:center;padding:10px 4px;background-color:#f0fdf4;">
                      <div style="font-size:20px;font-weight:700;color:#15803d;">${completed}</div>
                      <div style="font-size:11px;color:#15803d;">COMPLETADAS</div>
                    </td>
                    <td width="33%" style="text-align:center;padding:10px 4px;background-color:#fef2f2;border-radius:0 8px 8px 0;">
                      <div style="font-size:20px;font-weight:700;color:#b91c1c;">${pending}</div>
                      <div style="font-size:11px;color:#b91c1c;">PENDIENTES</div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${taskRows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background-color:#fafafa;border-top:1px solid #e4e4e7;">
                <p style="margin:0;font-size:12px;color:#a1a1aa;">Enviado desde TaskFlow.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido." });
  }

  const { to, tasks } = req.body as { to?: string; tasks?: TaskSummaryInput[] };

  if (!to || typeof to != "string" || !/\S+@\S+\.\S+/.test(to)) {
    return res.status(400).json({ error: "Destinatario inválido." });
  }

  if (!Array.isArray(tasks)) {
    return res.status(400).json({ error: "Lista de tareas inválida." });
  }

  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: process.env.SES_SENDER_EMAIL,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: "Resumen de tareas - TaskFlow" },
          Body: {
            Text: { Data: buildTextBody(tasks) },
            Html: { Data: buildHtmlBody(tasks) },
          },
        },
      }),
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error enviando email:", error);
    return res.status(500).json({ error: "No se pudo enviar el correo." });
  }
}
