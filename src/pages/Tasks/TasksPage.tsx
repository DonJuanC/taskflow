import { TaskForm } from "../../components/TaskForm/TaskForm";
import { TaskList } from "../../components/TaskList/TaskList";
import { SendSummaryButton } from "../../components/SendSummary/SendSummaryButton";
import "../../App.css";

// Página real de tareas: separada de App.tsx para poder cargarla con
// React.lazy(). Es la que arrastra Firestore + dnd-kit, así que conviene
// que ese peso se descargue recién cuando el usuario ya inició sesión y
// entra a "/", no en el bundle inicial que ve cualquiera en /login.
export function TasksPage() {
  return (
    <main className="page">
      <div className="page-header">
        <h1>Tus tareas</h1>
        <SendSummaryButton />
      </div>
      <TaskForm />
      <TaskList />
    </main>
  );
}
