import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogOut() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <nav>
      <Link to="/">TaskFlow</Link>

      {user ? (
        <div>
          <span>{user.email}</span>
          <button onClick={handleLogOut}>Cerrar sesión</button>
        </div>
      ) : (
        <div>
          <Link to="/login">Ingresar</Link>
          <Link to="/register">Registrarse</Link>
        </div>
      )}
    </nav>
  );
}
