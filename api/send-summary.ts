import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

interface TaskSummaryInput {
  title: string;
  completed: boolean;
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

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;

  const bodyText = [
    `Resumen de tus tareas en TaskFlow`,
    ``,
    `Total: ${tasks.length}`,
    `Completadas: ${completed}`,
    `Pendientes: ${pending}`,
    ``,
    ...tasks.map((t) => `${t.completed ? "[x]" : "[ ]"} ${t.title}`),
  ].join("\n");

  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: process.env.SES_SENDER_EMAIL,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: "Resumen de tareas - TaskFlow" },
          Body: { Text: { Data: bodyText } },
        },
      }),
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error enviando email:", error);
    return res.status(500).json({ error: "No se pudo enviar el correo." });
  }
}
