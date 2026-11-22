import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertaMensaje from "../components/AlertaMensaje.jsx";
import FormularioCheckout from "../components/FormularioCheckout.jsx";
import ResumenPedido from "../components/ResumenPedido.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { apiCrearBoleta } from "../services/api.js";
import { ENTREGA_RETIRO } from "../utils/constantes.js";
import { calcularSubtotal, calcularTotales } from "../utils/precios.js";

// Checkout: datos de contacto, opción de entrega y pago. La compra la procesa el backend (POST /boletas).
// Solo entran clientes y administradores con sesión (lo controla RutaProtegida en App.jsx).
export default function PaginaCheckout() {
  const navigate = useNavigate();
  const { items, vaciarCarrito } = useCarrito();
  const { usuario } = useAuth();
  const [opcionEntrega, setOpcionEntrega] = useState(ENTREGA_RETIRO);
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h2 fw-bold">Tu carrito está vacío</h1>
        <Link className="btn btn-dark" to="/productos">Ver productos</Link>
      </div>
    );
  }

  // Estos montos son solo una vista previa para el cliente: la boleta final la calcula el backend.
  const subtotal = calcularSubtotal(items);
  const { costoEnvio, total } = calcularTotales(subtotal, opcionEntrega);

  // El formulario se llena con los datos del usuario que inició sesión.
  const datosIniciales = { nombre: usuario.nombre, correo: usuario.correo, telefono: usuario.telefono, direccion: usuario.direccion };

  async function finalizarCompra(datos) {
    setEnviando(true);
    setMensajeError("");
    try {
      // Del carrito solo se envía el id y la cantidad de cada producto: el backend busca los precios.
      // El número de tarjeta solo viaja para el pago simulado; el backend no lo guarda.
      const boleta = await apiCrearBoleta({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        telefono: datos.telefono,
        opcionEntrega,
        direccion: datos.direccion,
        numeroTarjeta: datos.numeroTarjeta,
        items: items.map((item) => ({ idProducto: item.idProducto, cantidad: item.cantidad })),
      });

      vaciarCarrito();
      navigate(`/compra-exitosa/${boleta.id}`);
    } catch (error) {
      // 402 = pago rechazado. Cualquier otro error (datos inválidos, producto eliminado...) se muestra aquí.
      if (error.estado === 402) {
        navigate("/compra-fallida");
        return;
      }
      setMensajeError(error.message);
      setEnviando(false);
    }
  }

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Finalizar compra</h1>
      {mensajeError && <AlertaMensaje tipo="danger" mensaje={mensajeError} />}
      <div className="row g-4">
        <div className="col-lg-8">
          <FormularioCheckout
            datosIniciales={datosIniciales}
            opcionEntrega={opcionEntrega}
            onCambiarEntrega={setOpcionEntrega}
            onConfirmar={finalizarCompra}
            enviando={enviando}
          />
        </div>
        <div className="col-lg-4">
          <ResumenPedido subtotal={subtotal} costoEnvio={costoEnvio} total={total} />
        </div>
      </div>
    </div>
  );
}
