import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import {
  validateRegister,
  type RegisterFormErrors,
} from "../../utils/validateRegister";
import { getAuthErrorMessage } from "../../features/auth/authErrors";
import { Input } from "../../components/ui/Input/Input";
import { Button } from "../../components/ui/Button/Button";
import "../../styles/auth.css";

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
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-brand-mark">TaskFlow</span>
        <p className="auth-brand-tagline">
          Crea tu cuenta y empieza a ordenar tu día en segundos.
        </p>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h1>Registro</h1>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
            />

            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />

            <Input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
            />

            {firebaseError && <p className="form-error">{firebaseError}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="auth-footer">
            ¿Ya tienes cuenta? <Link to="/login">Ingresa</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
