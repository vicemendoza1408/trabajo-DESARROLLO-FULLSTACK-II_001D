import EstadoCarga from "../components/EstadoCarga.jsx";
import TablaProductosAdmin from "../components/TablaProductosAdmin.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { apiCategorias, apiProductos } from "../services/api.js";

// Lista de productos para el vendedor: solo lectura (no puede crear, editar ni eliminar).
export default function PaginaVendedorProductos() {
  const { datos, cargando, error } = useCargar(() => Promise.all([apiProductos(), apiCategorias()]));
  const [productos, categorias] = datos ?? [[], []];

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-1">Productos</h1>
      <p className="text-muted mb-4">Catálogo en modo consulta.</p>
      <EstadoCarga cargando={cargando} error={error}>
        <TablaProductosAdmin productos={productos} categorias={categorias} soloLectura />
      </EstadoCarga>
    </div>
  );
}
