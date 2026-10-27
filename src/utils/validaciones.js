// Validaciones del formulario de checkout. Son funciones puras:
// reciben los datos y devuelven un objeto con los errores (vacío si todo está bien).
import { ENTREGA_DESPACHO } from "./constantes.js";

const EXPRESION_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  return errores;
}
