// Ayudas compartidas por las pruebas. Este archivo no es una prueba (no termina en .spec),
// por eso Karma no lo ejecuta solo: los specs lo importan cuando lo necesitan.
//
// Idea principal: las pruebas NO necesitan el backend encendido. Con simularApi() se reemplaza
// fetch por una versión falsa que responde lo que cada prueba indique. Así se prueba el frontend
// completo (páginas, api.js, sesión) sin MySQL ni Spring.

import { waitFor } from "@testing-library/react";

// Espera hasta que la condición sea verdadera (máximo 1 segundo).
// Importante: dentro de waitFor NO se puede usar expect de Jasmine, porque expect no lanza error al fallar:
// solo lo anota y waitFor creería que ya se cumplió. Por eso se lanza un error a mano mientras no se cumpla.
export function esperarHasta(condicion) {
  return waitFor(() => {
    if (!condicion()) {
      throw new Error("La condición todavía no se cumple.");
    }
  });
}

// ---------- Datos de ejemplo (con la misma forma que responde el backend) ----------

export const CATEGORIAS = [
  { id: "poleras", nombre: "Poleras" },
  { id: "polerones", nombre: "Polerones" },
  { id: "accesorios", nombre: "Accesorios" },
];

export const PRODUCTOS = [
  { id: 1, nombre: "Polerón negro", descripcion: "Algodón", precio: 29990, descuentoPorcentaje: 0, idCategoria: "polerones", imagen: "/img/placeholder.svg" },
  { id: 2, nombre: "Polera blanca", descripcion: "Básica", precio: 9990, descuentoPorcentaje: 20, idCategoria: "poleras", imagen: "/img/placeholder.svg" },
  { id: 3, nombre: "Gorro de lana", descripcion: "Talla única", precio: 6990, descuentoPorcentaje: 10, idCategoria: "accesorios", imagen: "/img/placeholder.svg" },
  { id: 4, nombre: "Cinturón de cuero", descripcion: "Café", precio: 12990, descuentoPorcentaje: 0, idCategoria: "accesorios", imagen: "/img/placeholder.svg" },
];

export const USUARIO_CLIENTE = { id: 1, nombre: "Cliente Demo", correo: "cliente@fuma.cl", telefono: "912345678", direccion: "Av. Principal 123", rol: "CLIENTE" };
export const USUARIO_VENDEDOR = { id: 2, nombre: "Vendedor Demo", correo: "vendedor@fuma.cl", telefono: "923456789", direccion: "Calle 2", rol: "VENDEDOR" };
export const USUARIO_ADMIN = { id: 3, nombre: "Administrador Fuma", correo: "admin@fuma.cl", telefono: "934567890", direccion: "Calle 3", rol: "ADMIN" };

export const BOLETA = {
  id: 5,
  fecha: "2026-11-21T23:05:10",
  cliente: { nombre: "Cliente Demo", correo: "cliente@fuma.cl", telefono: "912345678" },
  direccion: null,
  opcionEntrega: "retiro",
  items: [{ idProducto: 2, nombre: "Polera blanca", imagen: "/img/placeholder.svg", precioUnitario: 7992, cantidad: 2 }],
  subtotal: 15984,
  costoEnvio: 0,
  total: 15984,
};

// ---------- Respuestas simuladas ----------

// Respuesta exitosa. Por defecto es un 200; para otros códigos: ok(cuerpo, 201) u ok(undefined, 204).
export function ok(cuerpo, estado = 200) {
  return { estado, cuerpo };
}

// Respuesta de error, con el mismo formato que envía el backend: { mensaje, errores }.
export function fallo(estado, mensaje, errores = {}) {
  return { estado, cuerpo: { estado, mensaje, errores } };
}

// Convierte una respuesta simulada en un Response real, como el que entrega fetch.
function construirResponse({ estado, cuerpo }) {
  const texto = cuerpo === undefined ? null : JSON.stringify(cuerpo);
  return new Response(texto, { status: estado, headers: { "Content-Type": "application/json" } });
}

// Reemplaza fetch por una versión falsa. "respuestas" dice qué responder a cada petición, con la
// forma "MÉTODO /ruta":
//   simularApi({
//     "GET /productos": ok(PRODUCTOS),
//     "POST /boletas": fallo(402, "Pago rechazado."),
//   });
// Cada valor puede ser una respuesta, o una función (opciones) => respuesta para casos dinámicos.
// Si la aplicación pide algo que la prueba no preparó, responde un error 501 que lo dice claramente.
// Devuelve el espía de fetch, por si la prueba quiere revisar qué se pidió (ver llamadasA).
export function simularApi(respuestas = {}) {
  return spyOn(window, "fetch").and.callFake((url, opciones = {}) => {
    const metodo = opciones.method ?? "GET";
    const ruta = url.replace(/^https?:\/\/[^/]+\/api\/v1/, "");
    const clave = `${metodo} ${ruta}`;

    const definida = respuestas[clave];
    if (definida === undefined) {
      return Promise.resolve(construirResponse(fallo(501, `Prueba sin respuesta simulada para: ${clave}`)));
    }
    const resultado = typeof definida === "function" ? definida(opciones) : definida;
    return Promise.resolve(resultado).then(construirResponse);
  });
}

// Una petición que nunca termina: sirve para probar el estado "Cargando...".
export function respuestaPendiente() {
  return new Promise(() => {});
}

// Devuelve las peticiones que se hicieron a una ruta, por ejemplo llamadasA(espia, "POST /boletas").
// Cada una trae las cabeceras y el cuerpo ya convertido a objeto.
export function llamadasA(espia, clave) {
  return espia.calls
    .allArgs()
    .filter(([url, opciones = {}]) => `${opciones.method ?? "GET"} ${url.replace(/^https?:\/\/[^/]+\/api\/v1/, "")}` === clave)
    .map(([, opciones = {}]) => ({
      cabeceras: opciones.headers ?? {},
      cuerpo: opciones.body === undefined ? undefined : JSON.parse(opciones.body),
    }));
}
