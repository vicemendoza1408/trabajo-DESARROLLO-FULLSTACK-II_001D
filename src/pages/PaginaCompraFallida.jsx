import { Link } from "react-router-dom";

// Se muestra cuando el pago es rechazado. El carrito no se vacía, así el cliente puede reintentar.
export default function PaginaCompraFallida() {
  return (
    <div className="container py-5 text-center">
      <h1 className="h2 fw-bold text-danger">No se pudo completar el pago</h1>
      <p className="text-muted">Revisa los datos de tu tarjeta e intenta nuevamente. Tu carrito sigue guardado.</p>
      <Link className="btn btn-dark me-2" to="/checkout">Intentar de nuevo</Link>
      <Link className="btn btn-outline-dark" to="/carrito">Volver al carrito</Link>
    </div>
  );
}
