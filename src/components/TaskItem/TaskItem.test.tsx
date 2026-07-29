import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskItem } from "./TaskItem";
import { updateTask, deleteTask } from "../../services/tasks";
import { formatDateDisplay } from "../../utils/date";
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

  it("presionar Enter en modo edicion guarda los cambios", async () => {
    vi.mocked(updateTask).mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const [titleInput] = screen.getAllByRole("textbox");
    await user.clear(titleInput);
    await user.type(titleInput, "Comprar pan integral{Enter}");

    expect(updateTask).toHaveBeenCalledWith("task-1", {
      title: "Comprar pan integral",
      description: "Del super de la esquina",
    });
    expect(await screen.findByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("presionar Escape en modo edicion cancela sin guardar", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const [titleInput] = screen.getAllByRole("textbox");
    await user.type(titleInput, "{Escape}");

    expect(updateTask).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("muestra la prioridad, la frecuencia y la fecha cuando la tarea las tiene", () => {
    const dueDate = new Date(2026, 7, 15);
    render(
      <TaskItem
        task={{
          ...baseTask,
          priority: "high",
          frequency: "weekly",
          dueDate,
        }}
      />,
    );

    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Semanal")).toBeInTheDocument();
    expect(screen.getByText(formatDateDisplay(dueDate))).toBeInTheDocument();
  });

  it("no muestra la fila de metadatos cuando la tarea no tiene fecha, prioridad ni frecuencia", () => {
    render(<TaskItem task={baseTask} />);

    expect(screen.queryByText("Alta")).not.toBeInTheDocument();
    expect(screen.queryByText("Baja")).not.toBeInTheDocument();
  });

  it("guardar en modo edicion incluye la prioridad y la frecuencia elegidas", async () => {
    vi.mocked(updateTask).mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} />);

    await user.click(screen.getByRole("button", { name: /editar/i }));
    await user.click(screen.getByRole("button", { name: "Baja" }));
    await user.click(screen.getByRole("button", { name: "Diaria" }));
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    expect(updateTask).toHaveBeenCalledWith("task-1", {
      title: "Comprar pan",
      description: "Del super de la esquina",
      priority: "low",
      frequency: "daily",
    });
  });

  it("el handle de arrastrar se deshabilita cuando sortable es false", () => {
    render(<TaskItem task={baseTask} sortable={false} />);

    expect(
      screen.getByRole("button", { name: "Reordenar tarea" }),
    ).toBeDisabled();
  });

  it("el handle de arrastrar esta habilitado por defecto", () => {
    render(<TaskItem task={baseTask} />);

    expect(
      screen.getByRole("button", { name: "Reordenar tarea" }),
    ).toBeEnabled();
  });
});
