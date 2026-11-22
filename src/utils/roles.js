import { ROLES } from "./constantes.js";

// Página a la que va cada rol después de iniciar sesión.
export function rutaInicioPorRol(rol) {
  if (rol === ROLES.ADMIN) {
    return "/admin";
  }
  if (rol === ROLES.VENDEDOR) {
    return "/boletas";
  }
  return "/";
}
