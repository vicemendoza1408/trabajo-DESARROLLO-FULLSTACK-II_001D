import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormularioLogin from "../components/FormularioLogin.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { rutaInicioPorRol } from "../utils/roles.js";

// Página de inicio de sesión. Al entrar, cada rol va a su página: el administrador al panel,
// el vendedor a las boletas y el cliente a la tienda. Si la persona venía de una página protegida
// (por ejemplo el checkout), vuelve a ella.
export default function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();
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
      navigate(ubicacion.state?.desde ?? rutaInicioPorRol(usuarioIniciado.rol));
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
