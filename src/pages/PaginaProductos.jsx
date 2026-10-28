import { useState } from "react";
import BarraBusqueda from "../components/BarraBusqueda.jsx";
import ListaProductos from "../components/ListaProductos.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { obtenerProductos } from "../data/baseDeDatos.js";
import { filtrarPorTexto } from "../utils/filtros.js";

// Catálogo completo con búsqueda por nombre. Los productos se leen una sola vez al abrir la página.
export default function PaginaProductos() {
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [productos] = useState(() => obtenerProductos());
  const { agregarAlCarrito } = useCarrito();

  const productosFiltrados = filtrarPorTexto(productos, textoBusqueda);

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Productos</h1>
      <BarraBusqueda valor={textoBusqueda} onCambiar={setTextoBusqueda} />
      <ListaProductos productos={productosFiltrados} onAgregarAlCarrito={agregarAlCarrito} />
    </div>
  );
}
