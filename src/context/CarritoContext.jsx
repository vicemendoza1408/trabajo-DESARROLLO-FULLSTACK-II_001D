import { createContext, useContext, useEffect, useState } from "react";
import { agregarItem, cambiarCantidad, eliminarItem } from "../utils/carrito.js";
import { CLAVE_CARRITO } from "../utils/constantes.js";

// Contexto global del carrito: cualquier componente dentro de CarritoProvider puede usarlo.
const CarritoContext = createContext(null);

// Lee el carrito guardado. Si no hay nada o el dato está dañado, el carrito empieza vacío.
function leerCarritoGuardado() {
  try {
    const guardado = window.localStorage.getItem(CLAVE_CARRITO);
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
}

// Proveedor: guarda el estado "items" y lo comparte con sus hijos.
export function CarritoProvider({ children }) {
  const [items, setItems] = useState(leerCarritoGuardado);

  // Cada vez que cambian los ítems, se guardan en localStorage para no perderlos al recargar.
  useEffect(() => {
    window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  }, [items]);

  function agregarAlCarrito(producto) {
    setItems((itemsActuales) => agregarItem(itemsActuales, producto));
  }

  function cambiarCantidadItem(idProducto, nuevaCantidad) {
    setItems((itemsActuales) => cambiarCantidad(itemsActuales, idProducto, nuevaCantidad));
  }

  function eliminarDelCarrito(idProducto) {
    setItems((itemsActuales) => eliminarItem(itemsActuales, idProducto));
  }

  function vaciarCarrito() {
    setItems([]);
  }

  // Total de unidades (no de productos distintos): es lo que muestra la insignia del carrito.
  const cantidadTotal = items.reduce((suma, item) => suma + item.cantidad, 0);

  const valor = {
    items,
    cantidadTotal,
    agregarAlCarrito,
    cambiarCantidadItem,
    eliminarDelCarrito,
    vaciarCarrito,
  };

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

// Hook para leer el carrito desde cualquier componente.
export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (contexto === null) {
    throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  }
  return contexto;
}
