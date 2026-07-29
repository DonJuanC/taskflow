import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../ui/Button/Button";
import "./Navbar.css";

export function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogOut() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        TaskFlow
      </Link>

      <div className="navbar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={
            theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
          }
          title={
            theme === "light" ? "Activar modo oscuro" : "Activar modo claro"
          }
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        {user ? (
          <div className="navbar-user">
            <span className="navbar-email">{user.email}</span>
            <Button variant="secondary" size="sm" onClick={handleLogOut}>
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <div className="navbar-links">
            <Link to="/login" className="navbar-link">
              Ingresar
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
