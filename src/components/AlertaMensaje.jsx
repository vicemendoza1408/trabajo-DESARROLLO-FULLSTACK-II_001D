// Mensaje de aviso con estilo de Bootstrap.
// Props:
//   tipo: "danger", "success", "warning", etc. (clase alert-*).
//   mensaje: texto a mostrar.
export default function AlertaMensaje({ tipo, mensaje }) {
  return (
    <div className={`alert alert-${tipo}`} role="alert">
      {mensaje}
    </div>
  );
}
