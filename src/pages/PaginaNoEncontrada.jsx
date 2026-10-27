import { Link } from "react-router-dom";

// Se muestra cuando la ruta no existe.
export default function PaginaNoEncontrada() {
  return (
    <div className="container py-5 text-center">
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}
