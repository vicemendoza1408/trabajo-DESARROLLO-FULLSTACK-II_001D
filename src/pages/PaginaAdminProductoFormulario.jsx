import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AlertaMensaje from "../components/AlertaMensaje.jsx";
import EstadoCarga from "../components/EstadoCarga.jsx";
import FormularioProducto from "../components/FormularioProducto.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiActualizarProducto, apiCategorias, apiCrearProducto, apiProducto } from "../services/api.js";

// Crear o editar un producto. Sin id en la URL = producto nuevo; con id = edición.
export default function PaginaAdminProductoFormulario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = id !== undefined;
  const [mensajeError, setMensajeError] = useState("");
  const [erroresServidor, setErroresServidor] = useState({});

  // Se piden las categorías (para el selector) y, si se edita, el producto actual.
  const { datos, cargando, error } = useCargar(
    () => Promise.all([apiCategorias(), esEdicion ? apiProducto(id) : Promise.resolve(null)]),
    [id]
  );
  const [categorias, productoActual] = datos ?? [[], null];

  if (error && error.estado === 404) {
    return (
      <div className="container py-5">
        <h1 className="h2 fw-bold">Producto no encontrado</h1>
        <Link to="/admin">Volver al panel</Link>
      </div>
    );
  }

  async function guardar(datosProducto) {
    setMensajeError("");
    setErroresServidor({});
    try {
      if (esEdicion) {
        await apiActualizarProducto(id, datosProducto);
      } else {
        await apiCrearProducto(datosProducto);
      }
      navigate("/admin");
    } catch (errorApi) {
      // El backend vuelve a validar: sus errores por campo se muestran junto a cada campo.
      setErroresServidor(errorApi.errores ?? {});
      setMensajeError(errorApi.message);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: "640px" }}>
      <h1 className="h2 fw-bold mb-4">{esEdicion ? "Editar producto" : "Nuevo producto"}</h1>
      {mensajeError && <AlertaMensaje tipo="danger" mensaje={mensajeError} />}
      <EstadoCarga cargando={cargando} error={error}>
        <FormularioProducto
          productoInicial={productoActual}
          categorias={categorias}
          onGuardar={guardar}
          erroresServidor={erroresServidor}
        />
      </EstadoCarga>
    </div>
  );
}
