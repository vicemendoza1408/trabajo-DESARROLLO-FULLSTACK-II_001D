import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/FormularioLogin.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Página de inicio de sesión. Al entrar, el administrador va al panel y el cliente a la tienda.
export default function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [mensajeError, setMensajeError] = useState("");

  function manejarInicioSesion(correo, contrasena) {
    if (correo === "" || contrasena === "") {
      setMensajeError("Completa el correo y la contraseña.");
      return;
    }

    const usuarioIniciado = iniciarSesion(correo, contrasena);
    if (!usuarioIniciado) {
      setMensajeError("Correo o contraseña incorrectos.");
      return;
    }

    navigate(usuarioIniciado.rol === "admin" ? "/admin" : "/");
  }

  return (
    <div className="container py-5" style={{ maxWidth: "480px" }}>
      <h1 className="h2 fw-bold mb-4">Ingresar</h1>
      <FormularioLogin onIniciarSesion={manejarInicioSesion} mensajeError={mensajeError} />
    </div>
  );
}
