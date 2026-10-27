import { useParams } from "react-router-dom";

// Detalle de un producto. El id llega desde la URL (/productos/:id).
export default function PaginaDetalleProducto() {
  const { id } = useParams();
  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold">Producto {id}</h1>
      <p className="text-muted">Detalle del producto (Fase 5).</p>
    </div>
  );
}
