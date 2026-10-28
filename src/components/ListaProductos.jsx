import TarjetaProducto from "./TarjetaProducto.jsx";

// Grilla responsiva de productos. Si no hay productos, muestra un mensaje.
// Props:
//   productos: arreglo de productos a mostrar.
//   onAgregarAlCarrito: se pasa a cada tarjeta.
export default function ListaProductos({ productos, onAgregarAlCarrito }) {
  if (productos.length === 0) {
    return <p className="text-muted">No hay productos que coincidan con la búsqueda.</p>;
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
      {productos.map((producto) => (
        <div className="col" key={producto.id}>
          <TarjetaProducto producto={producto} onAgregarAlCarrito={onAgregarAlCarrito} />
        </div>
      ))}
    </div>
  );
}
