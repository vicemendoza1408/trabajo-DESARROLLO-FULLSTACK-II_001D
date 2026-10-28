import { Link, useParams } from "react-router-dom";
import ResumenPedido from "../components/ResumenPedido.jsx";
import { obtenerPedidoPorId } from "../data/baseDeDatos.js";
import { ENTREGA_DESPACHO } from "../utils/constantes.js";
import { formatearPrecio } from "../utils/precios.js";

// Confirmación de compra con el resumen del pedido guardado.
// El número de pedido llega en la URL (/compra-exitosa/:idPedido).
export default function PaginaCompraExitosa() {
  const { idPedido } = useParams();
  const pedido = obtenerPedidoPorId(Number(idPedido));

  if (!pedido) {
    return (
      <div className="container py-5">
        <h1 className="h2 fw-bold">Pedido no encontrado</h1>
        <Link to="/productos">Volver a productos</Link>
      </div>
    );
  }

  const textoEntrega =
    pedido.opcionEntrega === ENTREGA_DESPACHO ? `Despacho a ${pedido.direccion}` : "Retiro en tienda";

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold text-success">¡Compra exitosa!</h1>
      <p className="text-muted">
        Pedido N.º {pedido.id} · Confirmación enviada a {pedido.cliente.correo}
      </p>

      <div className="row g-4">
        <div className="col-lg-8">
          <h2 className="h5 mb-3">Productos</h2>
          <ul className="list-group mb-3">
            {pedido.items.map((item) => (
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
          <ResumenPedido subtotal={pedido.subtotal} costoEnvio={pedido.costoEnvio} total={pedido.total} />
        </div>
      </div>

      <Link className="btn btn-dark mt-4" to="/productos">Seguir comprando</Link>
    </div>
  );
}
