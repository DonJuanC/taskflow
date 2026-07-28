import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskItem } from "./TaskItem";
import { updateTask, deleteTask } from "../../services/tasks";
import type { Task } from "../../types/task";

vi.mock("../../services/tasks", () => ({
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const baseTask: Task = {
  id: "task-1",
  title: "Comprar pan",
  description: "Del super de la esquina",
  completed: false,
  userId: "test-uid",
  createdAt: new Date(),
};

describe("TaskItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el titulo y la descripcion de la tarea", () => {
    render(<TaskItem task={baseTask} />);

    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
    expect(screen.getByText("Del super de la esquina")).toBeInTheDocument();
  });

  it("el checkbox refleja el estado completed de la tarea", () => {
    render(<TaskItem task={{ ...baseTask, completed: true }} />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("llama a updateTask invirtiendo completed al hacer clic en el checkbox", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} />);

    await user.click(screen.getByRole("checkbox"));

    expect(updateTask).toHaveBeenCalledWith("task-1", { completed: true });
  });

  it("llama a deleteTask al hacer clic en Eliminar", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} />);

    await user.click(screen.getByRole("button", { name: /eliminar/i }));

    expect(deleteTask).toHaveBeenCalledWith("task-1");
  });

  it("guardar en modo edicion llama a updateTask con los nuevos valores y cierra el modo edicion", async () => {
    vi.mocked(updateTask).mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));

    const [titleInput, descriptionInput] = screen.getAllByRole("textbox");
    await user.clear(titleInput);
    await user.type(titleInput, "Comprar pan integral");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Panaderia nueva");

    await user.click(screen.getByRole("button", { name: /guardar/i }));

    expect(updateTask).toHaveBeenCalledWith("task-1", {
      title: "Comprar pan integral",
      description: "Panaderia nueva",
    });
    expect(await screen.findByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("cancelar en modo edicion no llama a updateTask y restaura los valores originales", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));

    const [titleInput] = screen.getAllByRole("textbox");
    await user.clear(titleInput);
    await user.type(titleInput, "Un cambio que no debe guardarse");

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(updateTask).not.toHaveBeenCalled();
    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
  });
});
