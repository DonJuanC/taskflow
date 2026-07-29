import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../ui/Button/Button";
import "./ErrorBoundary.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Red de seguridad: si algo revienta en el render (un bug que no
// contemplamos, datos inesperados de Firestore, etc.), esto evita que la
// pantalla quede en blanco sin explicación. Sin esto, cualquier error no
// controlado tumba TODO el árbol de React.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Error no controlado:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Algo salió mal</h1>
          <p>Ocurrió un error inesperado. Recarga la página para seguir.</p>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
