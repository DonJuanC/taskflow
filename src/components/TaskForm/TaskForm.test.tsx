import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

    await user.type(
      screen.getByPlaceholderText("Título de la tarea"),
      "Comprar pan",
    );
    await user.type(
      screen.getByPlaceholderText("Descripción (opcional)"),
      "Del super",
    );
    await user.click(screen.getByRole("button", { name: /agregar tarea/i }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith(
        "test-uid",
        "Comprar pan",
        "Del super",
        undefined,
        undefined,
        undefined,
      );
    });
  });

  it("incluye fecha, prioridad y frecuencia cuando el usuario los completa", async () => {
    vi.mocked(createTask).mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<TaskForm />);

    await user.type(
      screen.getByPlaceholderText("Título de la tarea"),
      "Pagar arriendo",
    );

    fireEvent.change(screen.getByLabelText("Fecha y hora"), {
      target: { value: "2026-08-15T14:30" },
    });
    await user.click(screen.getByRole("button", { name: "Alta" }));
    await user.click(screen.getByRole("button", { name: "Mensual" }));

    await user.click(screen.getByRole("button", { name: /agregar tarea/i }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith(
        "test-uid",
        "Pagar arriendo",
        "",
        new Date(2026, 7, 15, 14, 30),
        "high",
        "monthly",
      );
    });
  });

  it("limpia el formulario despues de crear la tarea", async () => {
    vi.mocked(createTask).mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<TaskForm />);

    await user.type(
      screen.getByPlaceholderText("Título de la tarea"),
      "Comprar pan",
    );
    await user.click(screen.getByRole("button", { name: "Media" }));
    await user.click(screen.getByRole("button", { name: /agregar tarea/i }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Título de la tarea"),
      ).toHaveValue("");
    });
    expect(screen.getByRole("button", { name: "Media" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("muestra un error si createTask falla", async () => {
    vi.mocked(createTask).mockRejectedValueOnce(new Error("fallo de red"));
    const user = userEvent.setup();
    render(<TaskForm />);

    await user.type(
      screen.getByPlaceholderText("Título de la tarea"),
      "Comprar pan",
    );
    await user.click(screen.getByRole("button", { name: /agregar tarea/i }));

    expect(
      await screen.findByText("No se pudo crear la tarea. Intenta de nuevo."),
    ).toBeInTheDocument();
  });
});
