import { createContext, useContext, useEffect, useState } from "react";
import { buscarUsuarioPorCredenciales } from "../data/baseDeDatos.js";
import { CLAVE_SESION } from "../utils/constantes.js";

// Contexto de sesión: indica quién está conectado. Vale para cliente y administrador.
const AuthContext = createContext(null);

// Lee la sesión guardada. Si no existe o está dañada, nadie está conectado.
function leerSesionGuardada() {
  try {
    const guardada = window.localStorage.getItem(CLAVE_SESION);
    return guardada ? JSON.parse(guardada) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesionGuardada);

  // La sesión se guarda al iniciar y se borra al cerrar, para sobrevivir a una recarga.
  useEffect(() => {
    if (usuario) {
      window.localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    } else {
      window.localStorage.removeItem(CLAVE_SESION);
    }
  }, [usuario]);

  // Devuelve el usuario si las credenciales son correctas, o null si no.
  function iniciarSesion(correo, contrasena) {
    const usuarioEncontrado = buscarUsuarioPorCredenciales(correo, contrasena);
    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado);
    }
    return usuarioEncontrado;
  }

  function cerrarSesion() {
    setUsuario(null);
  }

  const valor = {
    usuario,
    esAdmin: usuario !== null && usuario.rol === "admin",
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
