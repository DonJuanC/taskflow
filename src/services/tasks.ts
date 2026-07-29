import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  doc,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { app } from "./firebase";
import type { Task } from "../types/task";

const db = getFirestore(app);
export const tasksCollection = collection(db, "tasks");

export async function createTask(
  userId: string,
  title: string,
  description: string,
  dueDate?: Date,
  priority?: Task["priority"],
  frequency?: Task["frequency"],
) {
  await addDoc(tasksCollection, {
    title,
    description,
    completed: false,
    userId,
    createdAt: serverTimestamp(),
    ...(dueDate && { dueDate }),
    ...(priority && { priority }),
    ...(frequency && { frequency }),
  });
}

export async function updateTask(
  taskId: string,
  data: Partial<{
    title: string;
    description: string;
    completed: boolean;
    order: number;
    // `null` es una señal explícita de "vaciar este campo" (ej. quitar la
    // fecha de vencimiento de una tarea que ya tenía una). Firestore no
    // acepta `undefined` como valor, así que acá se traduce a deleteField().
    dueDate: Date | null;
    priority: Task["priority"] | null;
    frequency: Task["frequency"] | null;
  }>,
) {
  const taskRef = doc(db, "tasks", taskId);
  const { dueDate, priority, frequency, ...rest } = data;

  await updateDoc(taskRef, {
    ...rest,
    ...(dueDate !== undefined && { dueDate: dueDate ?? deleteField() }),
    ...(priority !== undefined && { priority: priority ?? deleteField() }),
    ...(frequency !== undefined && { frequency: frequency ?? deleteField() }),
  });
}

export async function deleteTask(taskId: string) {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
}

// Persiste el nuevo orden tras un drag & drop: cada id recibe como `order`
// su índice en la lista ya reordenada.
export async function reorderTasks(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) => updateTask(id, { order: index })),
  );
}
