import { Route, Routes } from "react-router-dom";
import PaginaInicio from "./pages/PaginaInicio.jsx";
import PaginaNoEncontrada from "./pages/PaginaNoEncontrada.jsx";

// Tabla de rutas de la tienda. Se irá completando fase por fase.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicio />} />
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  );
}
