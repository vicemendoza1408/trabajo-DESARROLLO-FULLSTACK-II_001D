// Constantes compartidas de la tienda. Centralizarlas evita valores "mágicos" repetidos.

// Claves usadas en localStorage.
export const CLAVE_CARRITO = "fuma_carrito";
// Token JWT que entrega el backend al iniciar sesión. Es lo único que se guarda de la sesión.
export const CLAVE_TOKEN = "fuma_token";

// Opciones de entrega del checkout.
export const ENTREGA_RETIRO = "retiro";
export const ENTREGA_DESPACHO = "despacho";

// Costo fijo del despacho, en pesos chilenos (CLP).
export const COSTO_DESPACHO = 3990;

// Roles del sistema (los mismos valores que usa el backend).
export const ROLES = {
  ADMIN: "ADMIN",
  VENDEDOR: "VENDEDOR",
  CLIENTE: "CLIENTE",
};

// Cada cuántos minutos se renueva el token mientras la app está abierta (el token dura 30 minutos).
export const MINUTOS_RENOVACION_TOKEN = 20;

// Evento que se avisa a toda la app cuando el backend responde 401 (el token venció o ya no sirve).
export const EVENTO_SESION_EXPIRADA = "fuma:sesion-expirada";
