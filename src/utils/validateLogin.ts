export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export function validateLogin(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "El correo es obligatorio.";
  }

  if (!values.password) {
    errors.password = "La contraseña es obligatoria.";
  }

  return errors;
}
