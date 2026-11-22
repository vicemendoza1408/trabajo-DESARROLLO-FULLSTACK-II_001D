import { Link } from "react-router-dom";
import EstadoCarga from "../components/EstadoCarga.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiBoletas } from "../services/api.js";
import { ENTREGA_DESPACHO } from "../utils/constantes.js";
import { formatearFecha } from "../utils/fechas.js";
import { formatearPrecio } from "../utils/precios.js";

// Lista de todas las boletas (órdenes de compra), de la más nueva a la más antigua.
// La ven el vendedor y el administrador; el backend responde 403 a cualquier otro rol.
export default function PaginaBoletas() {
  const { datos, cargando, error } = useCargar(() => apiBoletas());
  const boletas = datos ?? [];

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Boletas</h1>
      <EstadoCarga cargando={cargando} error={error}>
        {boletas.length === 0 ? (
          <p className="text-muted">Todavía no hay boletas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>N.º</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th className="d-none d-md-table-cell">Entrega</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {boletas.map((boleta) => (
                  <tr key={boleta.id}>
                    <td>{boleta.id}</td>
                    <td>{formatearFecha(boleta.fecha)}</td>
                    <td>{boleta.cliente.nombre}</td>
                    <td className="d-none d-md-table-cell">
                      {boleta.opcionEntrega === ENTREGA_DESPACHO ? "Despacho" : "Retiro en tienda"}
                    </td>
                    <td>{formatearPrecio(boleta.total)}</td>
                    <td className="text-end">
                      <Link className="btn btn-sm btn-outline-dark" to={`/boletas/${boleta.id}`}>Ver detalle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </EstadoCarga>
    </div>
  );
}
