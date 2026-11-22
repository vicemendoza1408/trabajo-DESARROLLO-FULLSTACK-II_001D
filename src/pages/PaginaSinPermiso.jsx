import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { rutaInicioPorRol } from "../utils/roles.js";

// Se muestra cuando alguien con sesión entra a una página que su rol no puede ver.
export default function PaginaSinPermiso() {
  const { usuario } = useAuth();

  return (
    <div className="container py-5 text-center">
      <h1 className="h2 fw-bold">Sin permiso</h1>
      <p className="text-muted">Tu rol no tiene acceso a esta página.</p>
      <Link className="btn btn-dark" to={rutaInicioPorRol(usuario?.rol)}>Volver al inicio</Link>
    </div>
  );
}
