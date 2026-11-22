import { Link, useParams } from "react-router-dom";
import EstadoCarga from "../components/EstadoCarga.jsx";
import PrecioProducto from "../components/PrecioProducto.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiProducto } from "../services/api.js";

// Detalle de un producto. El id llega desde la URL (/productos/:id) y el producto se pide al backend.
export default function PaginaDetalleProducto() {
  const { id } = useParams();
  const { datos: producto, cargando, error } = useCargar(() => apiProducto(id), [id]);
  const { agregarAlCarrito } = useCarrito();

  // El backend responde 404 cuando el producto no existe.
  if (error && error.estado === 404) {
    return (
      <div className="container py-5">
        <h1 className="h2 fw-bold">Producto no encontrado</h1>
        <Link to="/productos">Volver a productos</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <EstadoCarga cargando={cargando} error={error}>
        {producto && (
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <img className="imagen-producto rounded" src={producto.imagen} alt={producto.nombre} />
            </div>
            <div className="col-md-6">
              <h1 className="h2 fw-bold">{producto.nombre}</h1>
              <p>{producto.descripcion}</p>
              <p className="fs-4">
                <PrecioProducto precio={producto.precio} descuentoPorcentaje={producto.descuentoPorcentaje} />
              </p>
              <button type="button" className="btn btn-dark btn-lg" onClick={() => agregarAlCarrito(producto)}>
                Agregar al carrito
              </button>
            </div>
          </div>
        )}
      </EstadoCarga>
    </div>
  );
}
