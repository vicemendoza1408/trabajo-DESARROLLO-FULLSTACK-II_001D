import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/FormularioLogin.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLES } from "../utils/constantes.js";

// Página de inicio de sesión. Al entrar, el administrador va al panel y el resto a la tienda.
export default function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [mensajeError, setMensajeError] = useState("");

  async function manejarInicioSesion(correo, contrasena) {
    if (correo === "" || contrasena === "") {
      setMensajeError("Completa el correo y la contraseña.");
      return;
    }

    try {
      // Pregunta al backend. Si las credenciales son incorrectas, lanza un error con su mensaje.
      const usuarioIniciado = await iniciarSesion(correo, contrasena);
      setMensajeError("");
      navigate(usuarioIniciado.rol === ROLES.ADMIN ? "/admin" : "/");
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: "480px" }}>
      <h1 className="h2 fw-bold mb-4">Ingresar</h1>
      <FormularioLogin onIniciarSesion={manejarInicioSesion} mensajeError={mensajeError} />
    </div>
  );
}
