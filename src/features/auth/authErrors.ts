import { FirebaseError } from "firebase/app";

const errorMessages: Record<string, string> = {
  "auth/email-already-in-use": "Ese correo ya está registrado.",
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/too-many-requests": "Demasiados intentos. Intenta de nuevo más tarde.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return errorMessages[error.code] ?? "Ocurrió un error. Intenta de nuevo.";
  }
  return "Ocurrió un error inesperado.";
}
