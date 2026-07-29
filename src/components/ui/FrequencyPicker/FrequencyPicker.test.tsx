import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FrequencyPicker } from "./FrequencyPicker";

describe("FrequencyPicker", () => {
  it("marca como presionada la pill que coincide con el value actual", () => {
    render(<FrequencyPicker value="weekly" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Semanal" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Diaria" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("llama a onChange con el valor de la pill que se clickea", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FrequencyPicker value="" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Mensual" }));

    expect(onChange).toHaveBeenCalledWith("monthly");
  });

  it("llama a onChange con string vacio al hacer clic en Ninguna", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FrequencyPicker value="daily" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Ninguna" }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});
