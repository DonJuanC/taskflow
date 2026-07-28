import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "./TaskForm";
import { createTask } from "../../services/tasks";

vi.mock("../../services/tasks", () => ({
  createTask: vi.fn(),
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ user: { uid: "test-uid", email: "test@test.com" } }),
}));

describe("TaskForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no llama a createTask si el titulo esta vacio", async () => {
    const user = userEvent.setup();
    render(<TaskForm />);

    await user.click(screen.getByRole("button", { name: /agregar tarea/i }));

    expect(createTask).not.toHaveBeenCalled();
    expect(screen.getByText("El título es obligatorio.")).toBeInTheDocument();
  });

  it("llama a createTask con los datos correctos cuando el formulario es valido", async () => {
    vi.mocked(createTask).mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<TaskForm />);

    await user.type(screen.getByPlaceholderText("Título de la tarea"), "Comprar pan");
    await user.type(screen.getByPlaceholderText("Descripción (opcional)"), "Del super");
    await user.click(screen.getByRole("button", { name: /agregar tarea/i }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith("test-uid", "Comprar pan", "Del super");
    });
  });

  it("muestra un error si createTask falla", async () => {
    vi.mocked(createTask).mockRejectedValueOnce(new Error("fallo de red"));
    const user = userEvent.setup();
    render(<TaskForm />);

    await user.type(screen.getByPlaceholderText("Título de la tarea"), "Comprar pan");
    await user.click(screen.getByRole("button", { name: /agregar tarea/i }));

    expect(
      await screen.findByText("No se pudo crear la tarea. Intenta de nuevo."),
    ).toBeInTheDocument();
  });
});
