import { calcularPrecioFinal, formatearPrecio } from "../utils/precios.js";

// Muestra el precio de un producto. Si tiene descuento, muestra el original tachado y el final.
// Props:
//   precio: precio original en CLP.
//   descuentoPorcentaje: 0 si no hay oferta.
export default function PrecioProducto({ precio, descuentoPorcentaje }) {
  if (descuentoPorcentaje <= 0) {
    return <span className="fw-bold">{formatearPrecio(precio)}</span>;
  }

  const precioFinal = calcularPrecioFinal(precio, descuentoPorcentaje);
  return (
    <span>
      <s className="text-muted me-2">{formatearPrecio(precio)}</s>
      <span className="fw-bold text-danger">{formatearPrecio(precioFinal)}</span>
    </span>
  );
}
