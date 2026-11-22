import ResumenPedido from "./ResumenPedido.jsx";
import { ENTREGA_DESPACHO } from "../utils/constantes.js";
import { formatearPrecio } from "../utils/precios.js";

// Contenido de una boleta: productos comprados, tipo de entrega y resumen de montos.
// Lo usan la página de compra exitosa (cliente) y el detalle de boleta (vendedor y administrador).
// Props:
//   boleta: la boleta tal como la entrega el backend (items, opcionEntrega, direccion, subtotal, costoEnvio, total).
export default function DetalleBoleta({ boleta }) {
  const textoEntrega =
    boleta.opcionEntrega === ENTREGA_DESPACHO ? `Despacho a ${boleta.direccion}` : "Retiro en tienda";

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <h2 className="h5 mb-3">Productos</h2>
        <ul className="list-group mb-3">
          {boleta.items.map((item) => (
            <li key={item.idProducto} className="list-group-item d-flex justify-content-between">
              <span>{item.nombre} × {item.cantidad}</span>
              <span>{formatearPrecio(item.precioUnitario * item.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p>
          <strong>Entrega:</strong> {textoEntrega}
        </p>
      </div>
      <div className="col-lg-4">
        <ResumenPedido subtotal={boleta.subtotal} costoEnvio={boleta.costoEnvio} total={boleta.total} />
      </div>
    </div>
  );
}
