import { useParams } from "react-router-dom";

// Lista de categorías. Si la URL trae una categoría (/categorias/:idCategoria), se filtra por ella.
export default function PaginaCategorias() {
  const { idCategoria } = useParams();
  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold">Categorías</h1>
      <p className="text-muted">
        {idCategoria ? `Categoría seleccionada: ${idCategoria}` : "Elige una categoría"} (Fase 6).
      </p>
    </div>
  );
}
