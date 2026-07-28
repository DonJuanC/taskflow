import { describe, it, expect } from "vitest";
import { validateLogin } from "./validateLogin";

describe("validateLogin", () => {
  it("devuelve error si el email esta vacio", () => {
    const errors = validateLogin({ email: "", password: "1234567" });
    expect(errors.email).toBe("El correo es obligatorio.");
  });

  it("devuelve error si la contrasena esta vacia", () => {
    const errors = validateLogin({ email: "test@test.com", password: "" });
    expect(errors.password).toBe("La contraseña es obligatoria.");
  });

  it("no devuelve errores con datos validados", () => {
    const errors = validateLogin({
      email: "test@test.com",
      password: "123456",
    });
    expect(Object.keys(errors).length).toBe(0);
  });
});
