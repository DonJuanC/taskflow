import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriorityPicker } from "./PriorityPicker";

describe("PriorityPicker", () => {
  it("marca como presionada la pill que coincide con el value actual", () => {
    render(<PriorityPicker value="medium" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Media" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Baja" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("llama a onChange con el valor de la pill que se clickea", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PriorityPicker value="" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Alta" }));

    expect(onChange).toHaveBeenCalledWith("high");
  });

  it("llama a onChange con string vacio al hacer clic en Ninguna", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PriorityPicker value="low" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Ninguna" }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});
