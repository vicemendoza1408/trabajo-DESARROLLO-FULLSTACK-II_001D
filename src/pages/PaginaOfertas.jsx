import EstadoCarga from "../components/EstadoCarga.jsx";
import ListaProductos from "../components/ListaProductos.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiProductos } from "../services/api.js";

// Solo los productos que tienen descuento. El filtro lo hace el backend (GET /productos?ofertas=true).
export default function PaginaOfertas() {
  const { datos, cargando, error } = useCargar(() => apiProductos({ ofertas: true }));
  const { agregarAlCarrito } = useCarrito();

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4">Ofertas</h1>
      <EstadoCarga cargando={cargando} error={error}>
        <ListaProductos productos={datos ?? []} onAgregarAlCarrito={agregarAlCarrito} />
      </EstadoCarga>
    </div>
  );
}
