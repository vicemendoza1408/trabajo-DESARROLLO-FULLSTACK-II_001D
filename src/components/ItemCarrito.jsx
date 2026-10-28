import SelectorCantidad from "./SelectorCantidad.jsx";
import { formatearPrecio } from "../utils/precios.js";

// Una fila del carrito: imagen, nombre, cantidad, subtotal de la línea y botón eliminar.
// Props:
//   item: ítem del carrito (idProducto, nombre, imagen, precioUnitario, cantidad).
//   onCambiarCantidad: recibe (idProducto, nuevaCantidad).
//   onEliminar: recibe idProducto.
export default function ItemCarrito({ item, onCambiarCantidad, onEliminar }) {
  const subtotalLinea = item.precioUnitario * item.cantidad;

  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom">
      <img src={item.imagen} alt={item.nombre} width="72" height="72" className="rounded" />

      <div className="flex-grow-1">
        <h2 className="h6 mb-1">{item.nombre}</h2>
        <p className="small text-muted mb-0">{formatearPrecio(item.precioUnitario)} c/u</p>
      </div>

      <SelectorCantidad
        cantidad={item.cantidad}
        onCambiar={(nuevaCantidad) => onCambiarCantidad(item.idProducto, nuevaCantidad)}
      />

      <span className="fw-bold text-nowrap">{formatearPrecio(subtotalLinea)}</span>

      <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => onEliminar(item.idProducto)}>
        Eliminar
      </button>
    </div>
  );
}
