// Servicio de comunicación con el backend (API REST de Spring Boot).
// TODOS los fetch de la aplicación están en este archivo: el resto del código solo llama a estas funciones.
import { CLAVE_TOKEN } from "../utils/constantes.js";

// Dirección base de la API. Sale del archivo .env (VITE_API_URL); si no existe, usa la de desarrollo.
const URL_API = import.meta.env?.VITE_API_URL ?? "http://localhost:8080/api/v1";

// ---------- Token JWT guardado en el navegador ----------

export function leerToken() {
  return window.localStorage.getItem(CLAVE_TOKEN);
}

export function guardarToken(token) {
  window.localStorage.setItem(CLAVE_TOKEN, token);
}

export function borrarToken() {
  window.localStorage.removeItem(CLAVE_TOKEN);
}

// ---------- Errores de la API ----------

// Error que se lanza cuando el backend responde con un código de error (400, 401, 403, 404...).
//   estado:  código HTTP (0 si no se pudo conectar con el servidor).
//   message: mensaje legible que envía el backend.
//   errores: errores por campo (por ejemplo { precio: "..." }), cuando el backend los entrega.
export class ErrorApi extends Error {
  constructor(estado, mensaje, errores = {}) {
    super(mensaje);
    this.estado = estado;
    this.errores = errores;
  }
}

// ---------- Función base ----------

// Hace una petición al backend y devuelve la respuesta ya convertida a objeto JavaScript.
// Si hay un token guardado, lo envía en el encabezado: Authorization: Bearer <token>.
async function solicitar(ruta, { metodo = "GET", cuerpo } = {}) {
  const cabeceras = { "Content-Type": "application/json" };
  const token = leerToken();
  if (token) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    // fetch falla (en vez de responder con un código) cuando no hay conexión con el servidor.
    throw new ErrorApi(0, "No se pudo conectar con el servidor. Revisa que el backend esté encendido.");
  }

  // 204 = "sin contenido": la operación salió bien y no hay nada que leer.
  if (respuesta.status === 204) {
    return null;
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, datos?.mensaje ?? "Ocurrió un error inesperado.", datos?.errores ?? {});
  }
  return datos;
}

// ---------- Autenticación ----------

// Devuelve { token, usuario }. Si el correo o la contraseña son incorrectos lanza ErrorApi (401).
export function apiLogin(correo, contrasena) {
  return solicitar("/auth/login", { metodo: "POST", cuerpo: { correo, contrasena } });
}

// Entrega un token nuevo (con la duración completa) a partir de uno que aún no vence.
export function apiRenovarToken() {
  return solicitar("/auth/refresh", { metodo: "POST" });
}

// Devuelve los datos del usuario dueño del token guardado. Sirve para recuperar la sesión al recargar.
export function apiMe() {
  return solicitar("/auth/me");
}

// ---------- Catálogo (público) ----------

export function apiCategorias() {
  return solicitar("/categorias");
}

// Lista productos. Filtros opcionales: { idCategoria: "poleras" } o { ofertas: true }.
export function apiProductos({ idCategoria, ofertas } = {}) {
  const parametros = new URLSearchParams();
  if (idCategoria) {
    parametros.set("idCategoria", idCategoria);
  }
  if (ofertas) {
    parametros.set("ofertas", "true");
  }
  const texto = parametros.toString();
  return solicitar(texto ? `/productos?${texto}` : "/productos");
}

export function apiProducto(id) {
  return solicitar(`/productos/${id}`);
}
