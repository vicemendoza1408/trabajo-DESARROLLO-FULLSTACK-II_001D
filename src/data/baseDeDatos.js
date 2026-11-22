// Base de datos simulada de Fuma: operaciones CRUD sobre localStorage.
// Los datos sobreviven a una recarga de la página. Ninguna función usa React.
import { CLAVE_PEDIDOS, CLAVE_PRODUCTOS } from "../utils/constantes.js";
import { PRODUCTOS_INICIALES } from "./datosIniciales.js";

// Lee una lista desde localStorage. Si la clave aún no existe, la crea con los datos semilla.
function leerLista(clave, datosSemilla) {
  const guardado = window.localStorage.getItem(clave);
  if (guardado === null) {
    escribirLista(clave, datosSemilla);
    return [...datosSemilla];
  }
  return JSON.parse(guardado);
}

// Guarda una lista completa en localStorage.
function escribirLista(clave, lista) {
  window.localStorage.setItem(clave, JSON.stringify(lista));
}

// Calcula el siguiente id disponible (el mayor id actual + 1).
function siguienteId(lista) {
  return lista.reduce((mayor, elemento) => Math.max(mayor, elemento.id), 0) + 1;
}

// ---------- Productos (CRUD completo) ----------

export function obtenerProductos() {
  return leerLista(CLAVE_PRODUCTOS, PRODUCTOS_INICIALES);
}

export function obtenerProductoPorId(id) {
  return obtenerProductos().find((producto) => producto.id === id) || null;
}

// Crea un producto nuevo con un id asignado automáticamente.
export function crearProducto(datos) {
  const productos = obtenerProductos();
  const nuevoProducto = { ...datos, id: siguienteId(productos) };
  escribirLista(CLAVE_PRODUCTOS, [...productos, nuevoProducto]);
  return nuevoProducto;
}

// Actualiza los campos indicados de un producto. Devuelve null si no existe.
export function actualizarProducto(id, cambios) {
  const productos = obtenerProductos();
  const indice = productos.findIndex((producto) => producto.id === id);
  if (indice === -1) {
    return null;
  }
  const productoActualizado = { ...productos[indice], ...cambios, id };
  productos[indice] = productoActualizado;
  escribirLista(CLAVE_PRODUCTOS, productos);
  return productoActualizado;
}

// Elimina un producto. Devuelve true si se eliminó, false si no existía.
export function eliminarProducto(id) {
  const productos = obtenerProductos();
  const productosRestantes = productos.filter((producto) => producto.id !== id);
  if (productosRestantes.length === productos.length) {
    return false;
  }
  escribirLista(CLAVE_PRODUCTOS, productosRestantes);
  return true;
}

// ---------- Pedidos (alta y consulta) ----------

export function obtenerPedidos() {
  return leerLista(CLAVE_PEDIDOS, []);
}

export function obtenerPedidoPorId(id) {
  return obtenerPedidos().find((pedido) => pedido.id === id) || null;
}

// Guarda un pedido aprobado. Devuelve el pedido con su id asignado.
export function crearPedido(datosPedido) {
  const pedidos = obtenerPedidos();
  const nuevoPedido = { ...datosPedido, id: siguienteId(pedidos) };
  escribirLista(CLAVE_PEDIDOS, [...pedidos, nuevoPedido]);
  return nuevoPedido;
}
