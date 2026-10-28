import { useState } from "react";
import ListaProductos from "../components/ListaProductos.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { obtenerProductos } from "../data/baseDeDatos.js";
import { obtenerOfertas } from "../utils/filtros.js";

// Solo los productos que tienen descuento.
export default function PaginaOfertas() {
  const [ofertas] = useState(() => obtenerOfertas(obtenerProductos()));
  const { agregarAlCarrito } = useCarrito();

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Ofertas</h1>
      <ListaProductos productos={ofertas} onAgregarAlCarrito={agregarAlCarrito} />
    </div>
  );
}
