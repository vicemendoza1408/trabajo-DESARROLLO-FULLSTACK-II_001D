import { Link, useNavigate, useParams } from "react-router-dom";
import FormularioProducto from "../components/FormularioProducto.jsx";
import { actualizarProducto, crearProducto, obtenerProductoPorId } from "../data/baseDeDatos.js";
import { CATEGORIAS_INICIALES } from "../data/datosIniciales.js";

// Crear o editar un producto. Sin id en la URL = producto nuevo; con id = edición.
export default function PaginaAdminProductoFormulario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = id !== undefined;
  const productoActual = esEdicion ? obtenerProductoPorId(Number(id)) : null;

  if (esEdicion && !productoActual) {
    return (
      <div className="container py-5">
        <h1 className="h2 fw-bold">Producto no encontrado</h1>
        <Link to="/admin">Volver al panel</Link>
      </div>
    );
  }

  function guardar(datosProducto) {
    if (esEdicion) {
      actualizarProducto(productoActual.id, datosProducto);
    } else {
      crearProducto(datosProducto);
    }
    navigate("/admin");
  }

  return (
    <div className="container py-5" style={{ maxWidth: "640px" }}>
      <h1 className="h2 fw-bold mb-4">{esEdicion ? "Editar producto" : "Nuevo producto"}</h1>
      <FormularioProducto productoInicial={productoActual} categorias={CATEGORIAS_INICIALES} onGuardar={guardar} />
    </div>
  );
}
