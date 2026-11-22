import { Route, Routes } from "react-router-dom";
import BarraNavegacion from "./components/BarraNavegacion.jsx";
import { useCarrito } from "./context/CarritoContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import PieDePagina from "./components/PieDePagina.jsx";
import PaginaInicio from "./pages/PaginaInicio.jsx";
import PaginaProductos from "./pages/PaginaProductos.jsx";
import PaginaDetalleProducto from "./pages/PaginaDetalleProducto.jsx";
import PaginaCategorias from "./pages/PaginaCategorias.jsx";
import PaginaOfertas from "./pages/PaginaOfertas.jsx";
import PaginaCarrito from "./pages/PaginaCarrito.jsx";
import PaginaCheckout from "./pages/PaginaCheckout.jsx";
import PaginaCompraExitosa from "./pages/PaginaCompraExitosa.jsx";
import PaginaCompraFallida from "./pages/PaginaCompraFallida.jsx";
import PaginaLogin from "./pages/PaginaLogin.jsx";
import PaginaAdmin from "./pages/PaginaAdmin.jsx";
import PaginaAdminProductoFormulario from "./pages/PaginaAdminProductoFormulario.jsx";
import PaginaNoEncontrada from "./pages/PaginaNoEncontrada.jsx";
import PaginaBoletas from "./pages/PaginaBoletas.jsx";
import PaginaBoletaDetalle from "./pages/PaginaBoletaDetalle.jsx";
import PaginaVendedorProductos from "./pages/PaginaVendedorProductos.jsx";
import PaginaVendedorProductoDetalle from "./pages/PaginaVendedorProductoDetalle.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import { ROLES } from "./utils/constantes.js";

// Qué roles pueden usar cada grupo de rutas protegidas.
const COMPRADORES = [ROLES.CLIENTE, ROLES.ADMIN];
const PERSONAL = [ROLES.VENDEDOR, ROLES.ADMIN];

// Layout general: barra arriba, pie abajo y, en medio, la página de la ruta actual.
// La insignia del carrito lee la cantidad desde el contexto.
export default function App() {
  const { cantidadTotal } = useCarrito();
  const { usuario, cerrarSesion } = useAuth();

  return (
    <>
      <BarraNavegacion cantidadCarrito={cantidadTotal} usuario={usuario} onCerrarSesion={cerrarSesion} />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/productos" element={<PaginaProductos />} />
          <Route path="/productos/:id" element={<PaginaDetalleProducto />} />
          <Route path="/categorias" element={<PaginaCategorias />} />
          <Route path="/categorias/:idCategoria" element={<PaginaCategorias />} />
          <Route path="/ofertas" element={<PaginaOfertas />} />
          <Route path="/carrito" element={<PaginaCarrito />} />
          <Route path="/compra-fallida" element={<PaginaCompraFallida />} />
          <Route path="/login" element={<PaginaLogin />} />

          {/* Comprar: clientes y administradores con sesión (el vendedor no compra). */}
          <Route path="/checkout" element={<RutaProtegida roles={COMPRADORES}><PaginaCheckout /></RutaProtegida>} />
          <Route path="/compra-exitosa/:idPedido" element={<RutaProtegida roles={COMPRADORES}><PaginaCompraExitosa /></RutaProtegida>} />

          {/* Administración de productos: solo el administrador. */}
          <Route path="/admin" element={<RutaProtegida roles={[ROLES.ADMIN]}><PaginaAdmin /></RutaProtegida>} />
          <Route path="/admin/productos/nuevo" element={<RutaProtegida roles={[ROLES.ADMIN]}><PaginaAdminProductoFormulario /></RutaProtegida>} />
          <Route path="/admin/productos/:id/editar" element={<RutaProtegida roles={[ROLES.ADMIN]}><PaginaAdminProductoFormulario /></RutaProtegida>} />

          {/* Boletas (lista y detalle): vendedor y administrador. */}
          <Route path="/boletas" element={<RutaProtegida roles={PERSONAL}><PaginaBoletas /></RutaProtegida>} />
          <Route path="/boletas/:id" element={<RutaProtegida roles={PERSONAL}><PaginaBoletaDetalle /></RutaProtegida>} />

          {/* Vista del vendedor: productos en modo consulta (lista y detalle). */}
          <Route path="/vendedor/productos" element={<RutaProtegida roles={PERSONAL}><PaginaVendedorProductos /></RutaProtegida>} />
          <Route path="/vendedor/productos/:id" element={<RutaProtegida roles={PERSONAL}><PaginaVendedorProductoDetalle /></RutaProtegida>} />
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </main>
      <PieDePagina />
    </>
  );
}
