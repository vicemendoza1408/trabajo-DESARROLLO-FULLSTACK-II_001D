import { useState } from "react";
import CampoFormulario from "./CampoFormulario.jsx";
import { ENTREGA_DESPACHO, ENTREGA_RETIRO } from "../utils/constantes.js";
import { validarDatosCheckout } from "../utils/validaciones.js";

// Valores vacíos de todos los campos del checkout.
const DATOS_VACIOS = { nombre: "", correo: "", telefono: "", direccion: "", numeroTarjeta: "" };

// Formulario del checkout: datos del cliente, opción de entrega y tarjeta.
// Valida al enviar y solo llama a onConfirmar cuando no hay errores.
// Props:
//   datosIniciales: valores precargados (por ejemplo, del usuario conectado).
//   opcionEntrega: "retiro" o "despacho" (la decide la página, porque afecta el total).
//   onCambiarEntrega: se llama con la nueva opción al elegir un radio.
//   onConfirmar: se llama con los datos cuando el formulario es válido.
export default function FormularioCheckout({ datosIniciales = {}, opcionEntrega, onCambiarEntrega, onConfirmar }) {
  const [datos, setDatos] = useState(() => ({ ...DATOS_VACIOS, ...datosIniciales }));
  const [errores, setErrores] = useState({});

  function actualizarCampo(campo, valor) {
    setDatos((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    const erroresEncontrados = validarDatosCheckout({ ...datos, opcionEntrega });
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length === 0) {
      onConfirmar(datos);
    }
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <h2 className="h5 mb-3">Datos del cliente</h2>
      <CampoFormulario etiqueta="Nombre" nombre="nombre" valor={datos.nombre} error={errores.nombre}
        onCambiar={(valor) => actualizarCampo("nombre", valor)} />
      <CampoFormulario etiqueta="Correo" nombre="correo" tipo="email" valor={datos.correo} error={errores.correo}
        onCambiar={(valor) => actualizarCampo("correo", valor)} />
      <CampoFormulario etiqueta="Teléfono" nombre="telefono" tipo="tel" valor={datos.telefono} error={errores.telefono}
        onCambiar={(valor) => actualizarCampo("telefono", valor)} />

      <h2 className="h5 mt-4 mb-3">Entrega</h2>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="entrega" id="entrega-retiro"
          checked={opcionEntrega === ENTREGA_RETIRO} onChange={() => onCambiarEntrega(ENTREGA_RETIRO)} />
        <label className="form-check-label" htmlFor="entrega-retiro">Retiro en tienda (sin costo)</label>
      </div>
      <div className="form-check mb-3">
        <input className="form-check-input" type="radio" name="entrega" id="entrega-despacho"
          checked={opcionEntrega === ENTREGA_DESPACHO} onChange={() => onCambiarEntrega(ENTREGA_DESPACHO)} />
        <label className="form-check-label" htmlFor="entrega-despacho">Despacho a domicilio</label>
      </div>

      {opcionEntrega === ENTREGA_DESPACHO && (
        <CampoFormulario etiqueta="Dirección de despacho" nombre="direccion" valor={datos.direccion}
          error={errores.direccion} onCambiar={(valor) => actualizarCampo("direccion", valor)} />
      )}

      <h2 className="h5 mt-4 mb-3">Pago</h2>
      <CampoFormulario etiqueta="Número de tarjeta" nombre="numeroTarjeta" valor={datos.numeroTarjeta}
        error={errores.numeroTarjeta} onCambiar={(valor) => actualizarCampo("numeroTarjeta", valor)} />

      <button type="submit" className="btn btn-dark btn-lg w-100 mt-2">
        Pagar
      </button>
    </form>
  );
}
