import { describe, it, expect } from "vitest";
import { validateRegister } from "./validateRegister";

describe("validateRegister", () => {
  it("devuelve error si el email esta vacio", () => {
    const errors = validateRegister({ email: "", password: "123456", confirmPassword: "123456" });
    expect(errors.email).toBe("El correo es obligatorio.");
  });

  it("devuelve error si el email tiene formato invalido", () => {
    const errors = validateRegister({ email: "no-es-un-email", password: "123456", confirmPassword: "123456" });
    expect(errors.email).toBe("El correo no es válido.");
  });

  it("devuelve error si la contrasena tiene menos de 6 caracteres", () => {
    const errors = validateRegister({ email: "test@test.com", password: "123", confirmPassword: "123" });
    expect(errors.password).toBe("La contraseña debe tener al menos 6 caracteres.");
  });

  it("devuelve error si las contrasenas no coinciden", () => {
    const errors = validateRegister({ email: "test@test.com", password: "123456", confirmPassword: "654321" });
    expect(errors.confirmPassword).toBe("Las contraseñas no coinciden.");
  });

  it("no devuelve errores con datos validos", () => {
    const errors = validateRegister({ email: "test@test.com", password: "123456", confirmPassword: "123456" });
    expect(Object.keys(errors).length).toBe(0);
  });
});
