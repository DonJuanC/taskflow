import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar";
import { Register } from "./pages/Register/Register";
import { Login } from "./pages/Login/Login";
import { ProtectedRoute } from "./routes/ProtectedRoute";

const TasksPage = lazy(() =>
  import("./pages/Tasks/TasksPage").then((m) => ({ default: m.TasksPage })),
);

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Suspense fallback={<p className="route-loading">Cargando...</p>}>
                <TasksPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
