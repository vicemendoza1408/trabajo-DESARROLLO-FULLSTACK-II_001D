import { Link, useParams } from "react-router-dom";
import PrecioProducto from "../components/PrecioProducto.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { obtenerProductoPorId } from "../data/baseDeDatos.js";

// Detalle de un producto. El id llega desde la URL (/productos/:id).
export default function PaginaDetalleProducto() {
  const { id } = useParams();
  const producto = obtenerProductoPorId(Number(id));
  const { agregarAlCarrito } = useCarrito();

  if (!producto) {
    return (
      <div className="container py-5">
        <h1 className="h2 fw-bold">Producto no encontrado</h1>
        <Link to="/productos">Volver a productos</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-4 align-items-center">
        <div className="col-md-6">
          <img className="img-fluid rounded" src={producto.imagen} alt={producto.nombre} />
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
    </div>
  );
}
