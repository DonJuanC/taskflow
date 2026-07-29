import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../services/firebase";
import { validateLogin, type LoginFormErrors } from "../../utils/validateLogin";
import { getAuthErrorMessage } from "../../features/auth/authErrors";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input/Input";
import { Button } from "../../components/ui/Button/Button";
import "../../styles/auth.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [firebaseError, setFirebaseError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Si ya hay sesión activa (ej. usuario vuelve a /login con el navegador),
  // lo mandamos directo a "/" sin mostrarle el formulario de nuevo.
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFirebaseError("");

    const errors = validateLogin({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setFirebaseError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setFirebaseError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
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
          Organiza tus tareas con claridad. Simple, rápido, tuyo.
        </p>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h1>Iniciar sesión</h1>

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

            {firebaseError && <p className="form-error">{firebaseError}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <Button
            variant="secondary"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continuar con Google
          </Button>

          <p className="auth-footer">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
