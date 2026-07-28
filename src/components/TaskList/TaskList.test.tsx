import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskList } from "./TaskList";
import { useTasks } from "../../hooks/useTasks";
import type { Task } from "../../types/task";

vi.mock("../../hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Comprar pan",
    description: "",
    completed: false,
    userId: "test-uid",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Pagar servicios",
    description: "",
    completed: true,
    userId: "test-uid",
    createdAt: new Date(),
  },
];

describe("TaskList", () => {
  it("muestra el estado de carga", () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: true, error: "" });

    render(<TaskList />);

    expect(screen.getByText("Cargando tareas...")).toBeInTheDocument();
  });

  it("muestra el estado de error", () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks: [],
      loading: false,
      error: "permission-denied",
    });

    render(<TaskList />);

    expect(
      screen.getByText("Ocurrió un error al cargar las tareas: permission-denied"),
    ).toBeInTheDocument();
  });

  it("muestra un mensaje cuando no hay tareas", () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: [], loading: false, error: "" });

    render(<TaskList />);

    expect(
      screen.getByText("No tienes tareas todavía. ¡Agrega la primera!"),
    ).toBeInTheDocument();
  });

  it("renderiza un TaskItem por cada tarea", () => {
    vi.mocked(useTasks).mockReturnValue({ tasks: sampleTasks, loading: false, error: "" });

    render(<TaskList />);

    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
    expect(screen.getByText("Pagar servicios")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
