import { useTasks } from "../../hooks/useTasks";
import { TaskItem } from "../TaskItem/TaskItem";

export function TaskList() {
  const { tasks, loading, error } = useTasks();

  if (loading) {
    return <p>Cargando tareas...</p>;
  }

  if (error) {
    return <p>Ocurrió un error al cargar las tareas: {error}</p>;
  }

  if (tasks.length === 0) {
    return <p>No tienes tareas todavía. ¡Agrega la primera!</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
