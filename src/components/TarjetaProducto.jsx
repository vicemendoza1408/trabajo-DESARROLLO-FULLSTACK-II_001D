import PrecioProducto from "./PrecioProducto.jsx";

// Tarjeta de un producto del catálogo.
// Props:
//   producto: objeto producto.
//   onAgregarAlCarrito: función que se llama al pulsar "Agregar", recibe el producto.
export default function TarjetaProducto({ producto, onAgregarAlCarrito }) {
  return (
    <div className="card h-100 shadow-sm">
      <img src={producto.imagen} alt={producto.nombre} className="card-img-top" />
      <div className="card-body d-flex flex-column">
        <h2 className="h6 card-title">{producto.nombre}</h2>
        <p className="card-text small text-muted">{producto.descripcion}</p>
        <div className="mt-auto mb-3">
          <PrecioProducto precio={producto.precio} descuentoPorcentaje={producto.descuentoPorcentaje} />
        </div>
        <button type="button" className="btn btn-dark" onClick={() => onAgregarAlCarrito(producto)}>
          Agregar
        </button>
      </div>
    </div>
  );
}
