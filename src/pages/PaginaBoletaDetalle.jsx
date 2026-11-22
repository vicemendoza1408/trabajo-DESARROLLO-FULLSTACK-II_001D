import { Link, useParams } from "react-router-dom";
import DetalleBoleta from "../components/DetalleBoleta.jsx";
import EstadoCarga from "../components/EstadoCarga.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiBoleta } from "../services/api.js";
import { formatearFecha } from "../utils/fechas.js";

// Detalle de una boleta para el vendedor y el administrador: quién compró, cuándo y qué.
export default function PaginaBoletaDetalle() {
  const { id } = useParams();
  const { datos: boleta, cargando, error } = useCargar(() => apiBoleta(id), [id]);

  return (
    <div className="container py-5">
      <Link to="/boletas">← Volver a boletas</Link>
      <EstadoCarga cargando={cargando} error={error}>
        {boleta && (
          <>
            <h1 className="h2 fw-bold mt-3">Boleta N.º {boleta.id}</h1>
            <p className="text-muted">
              {formatearFecha(boleta.fecha)} · {boleta.cliente.nombre} · {boleta.cliente.correo} · {boleta.cliente.telefono}
            </p>
            <DetalleBoleta boleta={boleta} />
          </>
        )}
      </EstadoCarga>
    </div>
  );
}
