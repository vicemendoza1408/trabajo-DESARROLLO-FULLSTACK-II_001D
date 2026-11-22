import { useParams } from "react-router-dom";
import EstadoCarga from "../components/EstadoCarga.jsx";
import FiltroCategorias from "../components/FiltroCategorias.jsx";
import ListaProductos from "../components/ListaProductos.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiCategorias, apiProductos } from "../services/api.js";

// Productos separados por categoría. La categoría llega en la URL (/categorias/:idCategoria).
// El filtro lo hace el backend (GET /productos?idCategoria=...), y las categorías también vienen de la API.
export default function PaginaCategorias() {
  const { idCategoria } = useParams();
  const { agregarAlCarrito } = useCarrito();

  // Se piden las dos cosas juntas; se vuelve a pedir cada vez que cambia la categoría de la URL.
  const { datos, cargando, error } = useCargar(
    () => Promise.all([apiCategorias(), apiProductos({ idCategoria })]),
    [idCategoria]
  );
  const [categorias, productos] = datos ?? [[], []];

  const categoriaActual = categorias.find((categoria) => categoria.id === idCategoria);

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">{categoriaActual ? categoriaActual.nombre : "Categorías"}</h1>
      <EstadoCarga cargando={cargando} error={error}>
        <FiltroCategorias categorias={categorias} categoriaActivaId={idCategoria} />
        <ListaProductos productos={productos} onAgregarAlCarrito={agregarAlCarrito} />
      </EstadoCarga>
    </div>
  );
}
