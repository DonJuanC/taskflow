import { Routes, Route } from "react-router-dom";
import { Register } from "./pages/Register/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home (temporal)</div>} />
      <Route path="/login" element={<div>Login (temporal)</div>} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
