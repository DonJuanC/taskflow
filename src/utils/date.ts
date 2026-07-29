// Convierte el valor de un <input type="datetime-local"> ("yyyy-mm-ddTHH:mm")
// a Date, interpretando todo en hora LOCAL. Evita el corrimiento de un día
// que causa `new Date("yyyy-mm-dd")`, que el motor parsea como UTC. Si no
// viene hora (compatibilidad con datos viejos, o el usuario no la puso),
// asume medianoche.
export function parseDateInput(value: string): Date | undefined {
  if (!value) return undefined;
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = (timePart ?? "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

// Inverso: de Date a string "yyyy-mm-ddTHH:mm" para precargar un
// <input type="datetime-local">.
export function formatDateInput(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Formato corto para mostrar en la tarjeta de tarea. Si la hora quedó en
// medianoche (00:00) asumimos que el usuario no la definió y mostramos
// solo la fecha, para no mostrar "15 ago, 00:00" en tareas viejas que se
// crearon antes de que existiera el campo de hora.
export function formatDateDisplay(date: Date): string {
  const datePart = date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });

  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  if (!hasTime) return datePart;

  const timePart = date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart}, ${timePart}`;
}
