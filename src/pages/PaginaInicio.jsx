import { Link } from "react-router-dom";

// Portada de la tienda con accesos a las secciones principales.
export default function PaginaInicio() {
  return (
    <div className="container py-5">
      <h1 className="display-5 fw-bold">Fuma</h1>
      <p className="lead">Ropa para el día a día: básicos, abrigo y accesorios.</p>
      <div className="d-flex flex-wrap gap-2">
        <Link className="btn btn-dark" to="/productos">Ver productos</Link>
        <Link className="btn btn-outline-dark" to="/ofertas">Ver ofertas</Link>
      </div>
    </div>
  );
}
