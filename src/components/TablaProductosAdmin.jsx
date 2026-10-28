import { Link } from "react-router-dom";
import { CATEGORIAS_INICIALES } from "../data/datosIniciales.js";
import { formatearPrecio } from "../utils/precios.js";

// Busca el nombre de una categoría por su id.
function nombreCategoria(idCategoria) {
  const categoria = CATEGORIAS_INICIALES.find((candidata) => candidata.id === idCategoria);
  return categoria ? categoria.nombre : "Sin categoría";
}

// Tabla de productos del panel. Eliminar pide confirmación antes de llamar a onEliminar.
// Props:
//   productos: arreglo de productos.
//   onEliminar: recibe el id del producto que se debe eliminar.
export default function TablaProductosAdmin({ productos, onEliminar }) {
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
                <Link className="btn btn-sm btn-outline-dark me-2" to={`/admin/productos/${producto.id}/editar`}>
                  Editar
                </Link>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => confirmarEliminacion(producto)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
