import { Link } from "react-router-dom";

// Botones para elegir una categoría. Cada botón es un enlace a su ruta.
// Props:
//   categorias: arreglo de categorías (id y nombre).
//   categoriaActivaId: id de la categoría seleccionada, o undefined para "Todas".
export default function FiltroCategorias({ categorias, categoriaActivaId }) {
  function claseBoton(activo) {
    return activo ? "btn btn-sm btn-dark" : "btn btn-sm btn-outline-dark";
  }

  return (
    <div className="d-flex flex-wrap gap-2 mb-4">
      <Link className={claseBoton(!categoriaActivaId)} to="/categorias">
        Todas
      </Link>
      {categorias.map((categoria) => (
        <Link
          key={categoria.id}
          className={claseBoton(categoria.id === categoriaActivaId)}
          to={`/categorias/${categoria.id}`}
        >
          {categoria.nombre}
        </Link>
      ))}
    </div>
  );
}
