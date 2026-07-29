import { describe, it, expect } from "vitest";
import { parseDateInput, formatDateInput, formatDateDisplay } from "./date";

describe("parseDateInput", () => {
  it("devuelve undefined si el valor esta vacio", () => {
    expect(parseDateInput("")).toBeUndefined();
  });

  it("interpreta una fecha sin hora como medianoche local", () => {
    const date = parseDateInput("2026-08-15");

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(7);
    expect(date?.getDate()).toBe(15);
    expect(date?.getHours()).toBe(0);
    expect(date?.getMinutes()).toBe(0);
  });

  it("interpreta fecha y hora en horario local, sin corrimiento por UTC", () => {
    const date = parseDateInput("2026-08-15T14:30");

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(7);
    expect(date?.getDate()).toBe(15);
    expect(date?.getHours()).toBe(14);
    expect(date?.getMinutes()).toBe(30);
  });
});

describe("formatDateInput", () => {
  it("devuelve string vacio si no hay fecha", () => {
    expect(formatDateInput(undefined)).toBe("");
  });

  it("hace el camino de ida y vuelta con parseDateInput sin perder datos", () => {
    const original = "2026-08-15T14:30";

    expect(formatDateInput(parseDateInput(original))).toBe(original);
  });
});

describe("formatDateDisplay", () => {
  it("no muestra la hora cuando la tarea quedo en medianoche", () => {
    const date = new Date(2026, 7, 15);

    expect(formatDateDisplay(date)).not.toMatch(/:/);
  });

  it("muestra la hora cuando la tarea tiene una hora definida", () => {
    const date = new Date(2026, 7, 15, 14, 30);

    expect(formatDateDisplay(date)).toMatch(/:/);
  });
});
