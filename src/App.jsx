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
          <Route path="/checkout" element={<PaginaCheckout />} />
          <Route path="/compra-exitosa/:idPedido" element={<PaginaCompraExitosa />} />
          <Route path="/compra-fallida" element={<PaginaCompraFallida />} />
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/admin" element={<PaginaAdmin />} />
          <Route path="/admin/productos/nuevo" element={<PaginaAdminProductoFormulario />} />
          <Route path="/admin/productos/:id/editar" element={<PaginaAdminProductoFormulario />} />
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </main>
      <PieDePagina />
    </>
  );
}
