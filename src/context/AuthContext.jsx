import { createContext, useContext, useEffect, useState } from "react";
import { apiLogin, apiMe, apiRenovarToken, borrarToken, guardarToken, leerToken } from "../services/api.js";
import { MINUTOS_RENOVACION_TOKEN, ROLES } from "../utils/constantes.js";

// Contexto de sesión: indica quién está conectado (cliente, vendedor o administrador).
// De la sesión solo se guarda el TOKEN en el navegador. Los datos del usuario (y su rol)
// se piden al backend cada vez que se abre la app, así siempre son los que tiene el servidor.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // true mientras se comprueba con el backend un token guardado (al abrir o recargar la página).
  const [cargandoSesion, setCargandoSesion] = useState(() => leerToken() !== null);

  // 1) Recuperar la sesión al abrir o recargar la página.
  // Si hay un token guardado, el backend (GET /auth/me) dice a quién pertenece.
  // Si el token venció o es inválido (401), se borra y la persona debe iniciar sesión de nuevo.
  useEffect(() => {
    if (leerToken() === null) {
      return;
    }
    apiMe()
      .then(setUsuario)
      .catch((error) => {
        if (error.estado === 401) {
          borrarToken();
        }
      })
      .finally(() => setCargandoSesion(false));
  }, []);

  // 2) Renovar el token mientras la sesión está activa, para que no venza si la persona sigue usando la tienda.
  useEffect(() => {
    if (usuario === null) {
      return;
    }
    const temporizador = setInterval(() => {
      apiRenovarToken()
        .then((respuesta) => guardarToken(respuesta.token))
        .catch((error) => {
          if (error.estado === 401) {
            cerrarSesion();
          }
        });
    }, MINUTOS_RENOVACION_TOKEN * 60 * 1000);

    // Al cerrar sesión (o salir de la app) se detiene el temporizador.
    return () => clearInterval(temporizador);
  }, [usuario]);

  // Inicia sesión en el backend. Si las credenciales son incorrectas, lanza un ErrorApi (401).
  async function iniciarSesion(correo, contrasena) {
    const respuesta = await apiLogin(correo, contrasena);
    guardarToken(respuesta.token);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }

  function cerrarSesion() {
    borrarToken();
    setUsuario(null);
  }

  const valor = {
    usuario,
    cargandoSesion,
    esAdmin: usuario !== null && usuario.rol === ROLES.ADMIN,
    iniciarSesion,
    cerrarSesion,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Hook para leer la sesión desde cualquier componente.
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (contexto === null) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return contexto;
}
