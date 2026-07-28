import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import {
  validateRegister,
  type RegisterFormErrors,
} from "../../utils/validateRegister";
import { getAuthErrorMessage } from "../../features/auth/authErrors";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [firebaseError, setFirebaseError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFirebaseError("");

    const errors = validateRegister({ email, password, confirmPassword });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setFirebaseError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Registro</h1>

      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {fieldErrors.email && <p>{fieldErrors.email}</p>}

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {fieldErrors.password && <p>{fieldErrors.password}</p>}

      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {fieldErrors.confirmPassword && <p>{fieldErrors.confirmPassword}</p>}

      {firebaseError && <p>{firebaseError}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
