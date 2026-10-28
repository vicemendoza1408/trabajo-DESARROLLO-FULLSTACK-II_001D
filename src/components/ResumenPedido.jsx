import { formatearPrecio } from "../utils/precios.js";

// Resumen de montos. El carrito solo conoce el subtotal; el despacho se calcula en el checkout.
// Props:
//   subtotal: suma de los ítems.
//   costoEnvio: costo del despacho, o null si aún no se conoce (en ese caso no se muestra el total).
//   total: se usa solo cuando costoEnvio tiene valor.
export default function ResumenPedido({ subtotal, costoEnvio = null, total }) {
  const envioConocido = costoEnvio !== null;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h5 card-title mb-3">Resumen</h2>

        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <span>{formatearPrecio(subtotal)}</span>
        </div>

        {envioConocido ? (
          <>
            <div className="d-flex justify-content-between mb-2">
              <span>Despacho</span>
              <span>{costoEnvio === 0 ? "Sin costo" : formatearPrecio(costoEnvio)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>{formatearPrecio(total)}</span>
            </div>
          </>
        ) : (
          <p className="small text-muted mb-0">El despacho se calcula al finalizar la compra.</p>
        )}
      </div>
    </div>
  );
}
