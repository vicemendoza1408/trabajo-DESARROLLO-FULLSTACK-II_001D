import { Link, useParams } from "react-router-dom";
import EstadoCarga from "../components/EstadoCarga.jsx";
import PrecioProducto from "../components/PrecioProducto.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiProducto } from "../services/api.js";

// Detalle de un producto para el vendedor: solo información, sin botón de compra.
export default function PaginaVendedorProductoDetalle() {
  const { id } = useParams();
  const { datos: producto, cargando, error } = useCargar(() => apiProducto(id), [id]);

  return (
    <div className="container py-5">
      <Link to="/vendedor/productos">← Volver a productos</Link>
      <EstadoCarga cargando={cargando} error={error}>
        {producto && (
          <div className="row g-4 align-items-center mt-1">
            <div className="col-md-6">
              <img className="imagen-producto rounded" src={producto.imagen} alt={producto.nombre} />
            </div>
            <div className="col-md-6">
              <h1 className="h2 fw-bold">{producto.nombre}</h1>
              <p>{producto.descripcion}</p>
              <p className="fs-4">
                <PrecioProducto precio={producto.precio} descuentoPorcentaje={producto.descuentoPorcentaje} />
              </p>
            </div>
          </div>
        )}
      </EstadoCarga>
    </div>
  );
}
