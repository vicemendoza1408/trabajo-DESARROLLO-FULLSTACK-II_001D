import { useParams } from "react-router-dom";

// Confirmación de compra. El número de pedido llega desde la URL (/compra-exitosa/:idPedido).
export default function PaginaCompraExitosa() {
  const { idPedido } = useParams();
  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold">¡Compra exitosa!</h1>
      <p className="text-muted">Pedido {idPedido} (resumen en Fase 8).</p>
    </div>
  );
}
