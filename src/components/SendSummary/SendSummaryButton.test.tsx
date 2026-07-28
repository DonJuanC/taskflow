import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SendSummaryButton } from "./SendSummaryButton";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import type { Task } from "../../types/task";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

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
];

describe("SendSummaryButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: "test-uid", email: "juan@test.com" } as never,
      loading: false,
    });
    vi.mocked(useTasks).mockReturnValue({ tasks: sampleTasks, loading: false, error: "" });
  });

  it("muestra un mensaje de exito cuando el envio funciona (caso feliz)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true } as Response),
    );
    const user = userEvent.setup();
    render(<SendSummaryButton />);

    await user.click(screen.getByRole("button", { name: /enviar resumen por correo/i }));

    expect(
      await screen.findByText("Resumen enviado a juan@test.com."),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("muestra un mensaje de error si el servidor responde con error (caso borde: error del serverless)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false } as Response),
    );
    const user = userEvent.setup();
    render(<SendSummaryButton />);

    await user.click(screen.getByRole("button", { name: /enviar resumen por correo/i }));

    expect(
      await screen.findByText("No se pudo enviar el resumen. Intenta de nuevo."),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("muestra un mensaje de error si la peticion falla por red", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    const user = userEvent.setup();
    render(<SendSummaryButton />);

    await user.click(screen.getByRole("button", { name: /enviar resumen por correo/i }));

    expect(
      await screen.findByText("No se pudo enviar el resumen. Intenta de nuevo."),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
