import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
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
    dueDate: Date;
    priority: Task["priority"];
    frequency: Task["frequency"];
  }>,
) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, data);
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
