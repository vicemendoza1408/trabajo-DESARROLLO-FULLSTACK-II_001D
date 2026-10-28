// Filtros de productos como funciones puras. Devuelven un arreglo nuevo, sin modificar el original.

// Productos cuyo nombre contiene el texto buscado (sin distinguir mayúsculas). Texto vacío = todos.
export function filtrarPorTexto(productos, texto) {
  const buscado = texto.trim().toLowerCase();
  if (buscado === "") {
    return productos;
  }
  return productos.filter((producto) => producto.nombre.toLowerCase().includes(buscado));
}

// Productos de una categoría. Sin categoría = todos.
export function filtrarPorCategoria(productos, idCategoria) {
  if (!idCategoria) {
    return productos;
  }
  return productos.filter((producto) => producto.idCategoria === idCategoria);
}

// Productos que tienen algún descuento.
export function obtenerOfertas(productos) {
  return productos.filter((producto) => producto.descuentoPorcentaje > 0);
}
