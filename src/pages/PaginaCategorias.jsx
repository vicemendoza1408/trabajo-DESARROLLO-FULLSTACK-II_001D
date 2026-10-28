import { useState } from "react";
import { useParams } from "react-router-dom";
import FiltroCategorias from "../components/FiltroCategorias.jsx";
import ListaProductos from "../components/ListaProductos.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { obtenerProductos } from "../data/baseDeDatos.js";
import { CATEGORIAS_INICIALES } from "../data/datosIniciales.js";
import { filtrarPorCategoria } from "../utils/filtros.js";

// Productos separados por categoría. La categoría llega en la URL (/categorias/:idCategoria). Los productos se leen una sola vez al abrir la página.
export default function PaginaCategorias() {
  const { idCategoria } = useParams();
  const [productos] = useState(() => obtenerProductos());
  const { agregarAlCarrito } = useCarrito();

  const categoriaActual = CATEGORIAS_INICIALES.find((categoria) => categoria.id === idCategoria);
  const productosDeCategoria = filtrarPorCategoria(productos, idCategoria);

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">{categoriaActual ? categoriaActual.nombre : "Categorías"}</h1>
      <FiltroCategorias categorias={CATEGORIAS_INICIALES} categoriaActivaId={idCategoria} />
      <ListaProductos productos={productosDeCategoria} onAgregarAlCarrito={agregarAlCarrito} />
    </div>
  );
}
