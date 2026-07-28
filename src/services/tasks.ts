import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const tasksCollection = collection(db, "tasks");

export async function createTask(
  userId: string,
  title: string,
  description: string,
) {
  await addDoc(tasksCollection, {
    title,
    description,
    completed: false,
    userId,
    createdAt: serverTimestamp(),
  });
}

export async function updateTask(
  taskId: string,
  data: Partial<{ title: string; description: string; completed: boolean }>,
) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, data);
}

export async function deleteTask(taskId: string) {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
}
