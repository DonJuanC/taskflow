import { describe, it, expect } from "vitest";
import { FirebaseError } from "firebase/app";
import { getAuthErrorMessage } from "./authErrors";

describe("getAuthErrorMessage", () => {
  it("traduce un codigo de Firebase conocido a un mensaje legible", () => {
    const error = new FirebaseError("auth/invalid-credential", "mensaje interno de firebase");
    expect(getAuthErrorMessage(error)).toBe("Correo o contraseña incorrectos.");
  });

  it("traduce otro codigo conocido distinto", () => {
    const error = new FirebaseError("auth/email-already-in-use", "mensaje interno de firebase");
    expect(getAuthErrorMessage(error)).toBe("Ese correo ya está registrado.");
  });

  it("devuelve un mensaje generico si el codigo de Firebase no esta mapeado", () => {
    const error = new FirebaseError("auth/codigo-inventado-no-existe", "mensaje interno");
    expect(getAuthErrorMessage(error)).toBe("Ocurrió un error. Intenta de nuevo.");
  });

  it("devuelve un mensaje generico si el error no es de Firebase", () => {
    expect(getAuthErrorMessage(new Error("otro tipo de error"))).toBe("Ocurrió un error inesperado.");
    expect(getAuthErrorMessage("un string cualquiera")).toBe("Ocurrió un error inesperado.");
    expect(getAuthErrorMessage(undefined)).toBe("Ocurrió un error inesperado.");
  });
});
