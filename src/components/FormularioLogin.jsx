import { useState } from "react";
import AlertaMensaje from "./AlertaMensaje.jsx";
import CampoFormulario from "./CampoFormulario.jsx";

// Formulario de inicio de sesión. Guarda lo que escribe el usuario y entrega los datos al enviar.
// Props:
//   onIniciarSesion: se llama con (correo, contrasena) al enviar el formulario.
//   mensajeError: aviso que muestra la página si el inicio de sesión falló (vacío = sin aviso).
export default function FormularioLogin({ onIniciarSesion, mensajeError = "" }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  function manejarEnvio(evento) {
    evento.preventDefault();
    onIniciarSesion(correo.trim(), contrasena);
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      {mensajeError && <AlertaMensaje tipo="danger" mensaje={mensajeError} />}
      <CampoFormulario etiqueta="Correo" nombre="correo" tipo="email" valor={correo} onCambiar={setCorreo} />
      <CampoFormulario
        etiqueta="Contraseña"
        nombre="contrasena"
        tipo="password"
        valor={contrasena}
        onCambiar={setContrasena}
      />
      <button type="submit" className="btn btn-dark w-100">
        Ingresar
      </button>
    </form>
  );
}
