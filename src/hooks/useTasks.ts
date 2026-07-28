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
            createdAt: (raw.createdAt as Timestamp)?.toDate(),
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
