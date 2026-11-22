import AlertaMensaje from "./AlertaMensaje.jsx";

// Muestra "Cargando..." mientras se espera la API, un aviso si falló y el contenido cuando todo salió bien.
// Props:
//   cargando: true mientras se espera la respuesta.
//   error: el ErrorApi de la petición, o null si no hubo error.
//   children: lo que se muestra cuando los datos ya llegaron.
export default function EstadoCarga({ cargando, error, children }) {
  if (cargando) {
    return (
      <div className="text-center py-5" role="status">
        <div className="spinner-border" aria-hidden="true" />
        <p className="mt-2 text-muted">Cargando...</p>
      </div>
    );
  }
  if (error) {
    return <AlertaMensaje tipo="danger" mensaje={error.message} />;
  }
  return children;
}
