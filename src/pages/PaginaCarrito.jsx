import { Link } from "react-router-dom";
import ItemCarrito from "../components/ItemCarrito.jsx";
import ResumenPedido from "../components/ResumenPedido.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { calcularSubtotal } from "../utils/precios.js";

// Página del carrito: lista de productos, cambio de cantidades, eliminación y resumen.
export default function PaginaCarrito() {
  const { items, cambiarCantidadItem, eliminarDelCarrito, vaciarCarrito } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h2 fw-bold">Tu carrito está vacío</h1>
        <p className="text-muted">Agrega productos para continuar con tu compra.</p>
        <Link className="btn btn-dark" to="/productos">Ver productos</Link>
      </div>
    );
  }

  const subtotal = calcularSubtotal(items);

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Tu carrito</h1>

      <div className="row g-4">
        <div className="col-lg-8">
          {items.map((item) => (
            <ItemCarrito
              key={item.idProducto}
              item={item}
              onCambiarCantidad={cambiarCantidadItem}
              onEliminar={eliminarDelCarrito}
            />
          ))}
          <button type="button" className="btn btn-link text-danger px-0 mt-3" onClick={vaciarCarrito}>
            Vaciar carrito
          </button>
        </div>

        <div className="col-lg-4">
          <ResumenPedido subtotal={subtotal} />
          <Link className="btn btn-dark w-100 mt-3" to="/checkout">
            Continuar con la compra
          </Link>
        </div>
      </div>
    </div>
  );
}
