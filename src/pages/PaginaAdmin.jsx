import { useState } from "react";
import { Link } from "react-router-dom";
import AlertaMensaje from "../components/AlertaMensaje.jsx";
import EstadoCarga from "../components/EstadoCarga.jsx";
import TablaProductosAdmin from "../components/TablaProductosAdmin.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiCategorias, apiEliminarProducto, apiProductos } from "../services/api.js";

// Panel de administración: lista de productos con acceso a crear, editar y eliminar.
// La protección de la ruta la hace RutaProtegida en App.jsx.
export default function PaginaAdmin() {
  // "version" sube cada vez que se elimina un producto, para volver a pedir la lista actualizada.
  const [version, setVersion] = useState(0);
  const [mensajeError, setMensajeError] = useState("");
  const { datos, cargando, error } = useCargar(
    () => Promise.all([apiProductos(), apiCategorias()]),
    [version]
  );
  const [productos, categorias] = datos ?? [[], []];

  async function manejarEliminar(id) {
    setMensajeError("");
    try {
      await apiEliminarProducto(id);
      setVersion((actual) => actual + 1);
    } catch (errorApi) {
      // Por ejemplo: "No se puede eliminar el producto porque ya tiene ventas registradas."
      setMensajeError(errorApi.message);
    }
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

      {mensajeError && <AlertaMensaje tipo="danger" mensaje={mensajeError} />}
      <EstadoCarga cargando={cargando} error={error}>
        <TablaProductosAdmin productos={productos} categorias={categorias} onEliminar={manejarEliminar} />
      </EstadoCarga>
    </div>
  );
}
