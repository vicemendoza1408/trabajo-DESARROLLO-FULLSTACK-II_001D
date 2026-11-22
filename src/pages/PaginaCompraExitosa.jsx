import { Link, useParams } from "react-router-dom";
import DetalleBoleta from "../components/DetalleBoleta.jsx";
import EstadoCarga from "../components/EstadoCarga.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiBoleta } from "../services/api.js";

// Confirmación de compra con el resumen de la boleta guardada en el backend.
// El número de boleta llega en la URL (/compra-exitosa/:idPedido).
export default function PaginaCompraExitosa() {
  const { idPedido } = useParams();
  const { datos: boleta, cargando, error } = useCargar(() => apiBoleta(idPedido), [idPedido]);

  if (error && error.estado === 404) {
    return (
      <div className="container py-5">
        <h1 className="h2 fw-bold">Pedido no encontrado</h1>
        <Link to="/productos">Volver a productos</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <EstadoCarga cargando={cargando} error={error}>
        {boleta && (
          <>
            <h1 className="h2 fw-bold text-success">¡Compra exitosa!</h1>
            <p className="text-muted">
              Pedido N.º {boleta.id} · Confirmación enviada a {boleta.cliente.correo}
            </p>
            <DetalleBoleta boleta={boleta} />
            <Link className="btn btn-dark mt-4" to="/productos">Seguir comprando</Link>
          </>
        )}
      </EstadoCarga>
    </div>
  );
}
