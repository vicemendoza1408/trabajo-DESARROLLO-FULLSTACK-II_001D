import { useState } from "react";
import { Link } from "react-router-dom";
import TablaProductosAdmin from "../components/TablaProductosAdmin.jsx";
import { eliminarProducto, obtenerProductos } from "../data/baseDeDatos.js";

// Panel de administración: lista de productos con acceso a crear, editar y eliminar.
// La protección de la ruta la hace RutaAdmin en App.jsx.
export default function PaginaAdmin() {
  const [productos, setProductos] = useState(() => obtenerProductos());

  function manejarEliminar(id) {
    eliminarProducto(id);
    setProductos(obtenerProductos());
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h2 fw-bold mb-1">Panel de administración</h1>
          <p className="text-muted mb-0">{productos.length} productos en el catálogo</p>
        </div>
        <Link className="btn btn-dark" to="/admin/productos/nuevo">Nuevo producto</Link>
      </div>

      <TablaProductosAdmin productos={productos} onEliminar={manejarEliminar} />
    </div>
  );
}
