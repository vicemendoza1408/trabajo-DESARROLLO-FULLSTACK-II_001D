import { useState } from "react";
import BarraBusqueda from "../components/BarraBusqueda.jsx";
import EstadoCarga from "../components/EstadoCarga.jsx";
import ListaProductos from "../components/ListaProductos.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiProductos } from "../services/api.js";
import { filtrarPorTexto } from "../utils/filtros.js";

// Catálogo completo con búsqueda por nombre. Los productos se piden al backend una sola vez al abrir la página;
// la búsqueda por texto se hace aquí, sobre la lista que ya llegó.
export default function PaginaProductos() {
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const { datos, cargando, error } = useCargar(() => apiProductos());
  const { agregarAlCarrito } = useCarrito();

  const productosFiltrados = filtrarPorTexto(datos ?? [], textoBusqueda);

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Productos</h1>
      <BarraBusqueda valor={textoBusqueda} onCambiar={setTextoBusqueda} />
      <EstadoCarga cargando={cargando} error={error}>
        <ListaProductos productos={productosFiltrados} onAgregarAlCarrito={agregarAlCarrito} />
      </EstadoCarga>
    </div>
  );
}
