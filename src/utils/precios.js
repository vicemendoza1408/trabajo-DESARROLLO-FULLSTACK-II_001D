// Funciones puras de precios. No dependen de React: se pueden probar directamente.
import { COSTO_DESPACHO, ENTREGA_DESPACHO } from "./constantes.js";

// Devuelve el precio con descuento, redondeado a pesos enteros.
export function calcularPrecioFinal(precio, descuentoPorcentaje) {
  return Math.round((precio * (100 - descuentoPorcentaje)) / 100);
}

// Formatea un monto en pesos chilenos, por ejemplo "$29.990".
export function formatearPrecio(monto) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(monto);
}

// Suma el precio unitario por la cantidad de cada ítem del carrito.
export function calcularSubtotal(items) {
  return items.reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0);
}

// Calcula el total: el subtotal más el despacho, solo si la entrega es a domicilio.
export function calcularTotales(subtotal, opcionEntrega) {
  const costoEnvio = opcionEntrega === ENTREGA_DESPACHO ? COSTO_DESPACHO : 0;
  return { subtotal, costoEnvio, total: subtotal + costoEnvio };
}
