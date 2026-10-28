import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormularioCheckout from "../components/FormularioCheckout.jsx";
import ResumenPedido from "../components/ResumenPedido.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { crearPedido } from "../data/baseDeDatos.js";
import { ENTREGA_DESPACHO, ENTREGA_RETIRO } from "../utils/constantes.js";
import { calcularSubtotal, calcularTotales } from "../utils/precios.js";
import { pagoEsAprobado } from "../utils/pago.js";

// Checkout: datos de envío, opción de entrega, pago simulado y creación del pedido.
export default function PaginaCheckout() {
  const navigate = useNavigate();
  const { items, vaciarCarrito } = useCarrito();
  const { usuario } = useAuth();
  const [opcionEntrega, setOpcionEntrega] = useState(ENTREGA_RETIRO);

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h2 fw-bold">Tu carrito está vacío</h1>
        <Link className="btn btn-dark" to="/productos">Ver productos</Link>
      </div>
    );
  }

  const subtotal = calcularSubtotal(items);
  const { costoEnvio, total } = calcularTotales(subtotal, opcionEntrega);

  // Si hay sesión iniciada, el formulario se llena con los datos del usuario.
  const datosIniciales = usuario
    ? { nombre: usuario.nombre, correo: usuario.correo, telefono: usuario.telefono, direccion: usuario.direccion }
    : {};

  function finalizarCompra(datos) {
    if (!pagoEsAprobado(datos.numeroTarjeta)) {
      navigate("/compra-fallida");
      return;
    }

    // El número de tarjeta NO se guarda en el pedido.
    const pedido = crearPedido({
      fecha: new Date().toISOString(),
      cliente: {
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        telefono: datos.telefono.replace(/\s/g, ""),
      },
      direccion: opcionEntrega === ENTREGA_DESPACHO ? datos.direccion.trim() : null,
      opcionEntrega,
      items,
      subtotal,
      costoEnvio,
      total,
    });

    vaciarCarrito();
    navigate(`/compra-exitosa/${pedido.id}`);
  }

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Finalizar compra</h1>
      <div className="row g-4">
        <div className="col-lg-8">
          <FormularioCheckout
            datosIniciales={datosIniciales}
            opcionEntrega={opcionEntrega}
            onCambiarEntrega={setOpcionEntrega}
            onConfirmar={finalizarCompra}
          />
        </div>
        <div className="col-lg-4">
          <ResumenPedido subtotal={subtotal} costoEnvio={costoEnvio} total={total} />
        </div>
      </div>
    </div>
  );
}
