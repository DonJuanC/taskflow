import { useState, useEffect } from "react";
import {
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { tasksCollection } from "../services/tasks";
import { useAuth } from "./useAuth";
import type { Task } from "../types/task";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const tasksQuery = query(
      tasksCollection,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => {
          const raw = docSnap.data();
          return {
            id: docSnap.id,
            title: raw.title,
            description: raw.description,
            completed: raw.completed,
            userId: raw.userId,
            // serverTimestamp() no se puede resolver localmente: mientras el
            // servidor no confirma el write, Firestore entrega este campo en
            // null (createTask lo usa para createdAt). Sin este fallback,
            // la tarea recién creada queda con createdAt undefined durante
            // esa fracción de segundo y cualquier código que llame
            // .getTime() sobre ella (como el orden de TaskList) explota,
            // tumbando toda la pantalla. onSnapshot se vuelve a disparar
            // con el valor real apenas el servidor confirma.
            createdAt: raw.createdAt
              ? (raw.createdAt as Timestamp).toDate()
              : new Date(),
            order: raw.order,
            dueDate: raw.dueDate
              ? (raw.dueDate as Timestamp).toDate()
              : undefined,
            priority: raw.priority,
            frequency: raw.frequency,
          } as Task;
        });
        setTasks(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  return { tasks, loading, error };
}
