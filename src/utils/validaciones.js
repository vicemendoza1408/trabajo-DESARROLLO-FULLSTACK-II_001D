// Validaciones del formulario de checkout. Son funciones puras:
// reciben los datos y devuelven un objeto con los errores (vacío si todo está bien).
import { ENTREGA_DESPACHO } from "./constantes.js";

const EXPRESION_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // algo@dominio.ext, sin espacios
// Teléfono chileno de celular: 9 dígitos que empiezan con 9.
const EXPRESION_TELEFONO = /^9\d{8}$/;

export function validarDatosCheckout(datos) {
  const errores = {};

  if (!datos.nombre || datos.nombre.trim() === "") {
    errores.nombre = "Ingresa tu nombre.";
  }

  if (!EXPRESION_CORREO.test(datos.correo || "")) {
    errores.correo = "Ingresa un correo válido.";
  }

  if (!EXPRESION_TELEFONO.test((datos.telefono || "").replace(/\s/g, ""))) {
    errores.telefono = "Ingresa un celular de 9 dígitos que comience con 9.";
  }

  // La dirección solo es obligatoria cuando el pedido se despacha a domicilio.
  if (datos.opcionEntrega === ENTREGA_DESPACHO && (!datos.direccion || datos.direccion.trim() === "")) {
    errores.direccion = "Ingresa una dirección de despacho.";
  }

  // El número de tarjeta debe tener 16 dígitos (los espacios se ignoran).
  const numeroTarjeta = (datos.numeroTarjeta || "").replace(/\s/g, "");
  if (!/^\d{16}$/.test(numeroTarjeta)) {
    errores.numeroTarjeta = "Ingresa una tarjeta de 16 dígitos.";
  }

  return errores;
}

// Validación del formulario de producto del panel de administración.
// Recibe los campos tal como los escribe el usuario (texto) y la lista de categorías válidas.
export function validarProducto(datos, categorias) {
  const errores = {};

  if (!datos.nombre || datos.nombre.trim() === "") {
    errores.nombre = "Ingresa el nombre del producto.";
  }

  const precio = Number(datos.precio);
  if (!Number.isInteger(precio) || precio <= 0) {
    errores.precio = "El precio debe ser un número entero mayor que 0.";
  }

  // Si el descuento viene vacío, se considera 0.
  const descuento = Number(datos.descuentoPorcentaje || 0);
  if (!Number.isInteger(descuento) || descuento < 0 || descuento > 100) {
    errores.descuentoPorcentaje = "El descuento debe ser un número entero entre 0 y 100.";
  }

  if (!categorias.some((categoria) => categoria.id === datos.idCategoria)) {
    errores.idCategoria = "Selecciona una categoría.";
  }

  return errores;
}
