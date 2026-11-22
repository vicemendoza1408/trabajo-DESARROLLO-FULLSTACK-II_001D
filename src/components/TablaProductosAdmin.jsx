import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/precios.js";

// Tabla de productos del panel. La usan el administrador (con editar y eliminar)
// y el vendedor (solo lectura, con un enlace al detalle).
// Props:
//   productos: arreglo de productos.
//   categorias: arreglo de categorías, para mostrar el nombre de la categoría de cada producto.
//   soloLectura: si es true no hay botones de editar ni eliminar (vista del vendedor).
//   onEliminar: recibe el id del producto que se debe eliminar (se pide confirmación antes).
export default function TablaProductosAdmin({ productos, categorias, soloLectura = false, onEliminar = () => {} }) {
  // Busca el nombre de una categoría por su id.
  function nombreCategoria(idCategoria) {
    const categoria = categorias.find((candidata) => candidata.id === idCategoria);
    return categoria ? categoria.nombre : "Sin categoría";
  }

  function confirmarEliminacion(producto) {
    if (window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
      onEliminar(producto.id);
    }
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th className="d-none d-md-table-cell">Categoría</th>
            <th>Precio</th>
            <th className="d-none d-sm-table-cell">Descuento</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td className="d-none d-md-table-cell">{nombreCategoria(producto.idCategoria)}</td>
              <td>{formatearPrecio(producto.precio)}</td>
              <td className="d-none d-sm-table-cell">{producto.descuentoPorcentaje}%</td>
              <td className="text-end text-nowrap">
                {soloLectura ? (
                  <Link className="btn btn-sm btn-outline-dark" to={`/vendedor/productos/${producto.id}`}>
                    Ver detalle
                  </Link>
                ) : (
                  <>
                    <Link className="btn btn-sm btn-outline-dark me-2" to={`/admin/productos/${producto.id}/editar`}>
                      Editar
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => confirmarEliminacion(producto)}>
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
