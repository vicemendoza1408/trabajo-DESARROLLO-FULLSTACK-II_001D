// Operaciones del carrito como funciones puras.
// Cada función devuelve un arreglo NUEVO: nunca modifica el original.
// Así React detecta el cambio y las pruebas son simples de escribir.
import { calcularPrecioFinal } from "./precios.js";

// Agrega un producto. Si ya estaba en el carrito, suma 1 a su cantidad.
export function agregarItem(items, producto) {
  const yaExiste = items.some((item) => item.idProducto === producto.id);

  if (yaExiste) {
    return items.map((item) =>
      item.idProducto === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
    );
  }

  const nuevoItem = {
    idProducto: producto.id,
    nombre: producto.nombre,
    imagen: producto.imagen,
    precioUnitario: calcularPrecioFinal(producto.precio, producto.descuentoPorcentaje),
    cantidad: 1,
  };
  return [...items, nuevoItem];
}

// Cambia la cantidad de un ítem. Si la cantidad es 0 o menor, el ítem se elimina.
export function cambiarCantidad(items, idProducto, nuevaCantidad) {
  if (nuevaCantidad <= 0) {
    return eliminarItem(items, idProducto);
  }
  return items.map((item) =>
    item.idProducto === idProducto ? { ...item, cantidad: nuevaCantidad } : item
  );
}

// Quita un ítem del carrito.
export function eliminarItem(items, idProducto) {
  return items.filter((item) => item.idProducto !== idProducto);
}
