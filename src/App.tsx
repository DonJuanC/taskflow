import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar";
import { Register } from "./pages/Register/Register";
import { Login } from "./pages/Login/Login";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { TaskForm } from "./components/TaskForm/TaskForm";
import { TaskList } from "./components/TaskList/TaskList";
import { SendSummaryButton } from "./components/SendSummary/SendSummaryButton";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <TaskForm />
                <SendSummaryButton />
                <TaskList />
              </>
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
