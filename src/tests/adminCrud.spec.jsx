import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FormularioProducto from "../components/FormularioProducto.jsx";
import RutaAdmin from "../components/RutaAdmin.jsx";
import TablaProductosAdmin from "../components/TablaProductosAdmin.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { actualizarProducto, obtenerProductoPorId, obtenerProductos } from "../data/baseDeDatos.js";
import { CATEGORIAS_INICIALES } from "../data/datosIniciales.js";
import PaginaAdmin from "../pages/PaginaAdmin.jsx";
import PaginaAdminProductoFormulario from "../pages/PaginaAdminProductoFormulario.jsx";
import { CLAVE_SESION } from "../utils/constantes.js";

// Sesión de administrador para las pruebas que la necesitan.
const SESION_ADMIN = { id: 2, nombre: "Administrador Fuma", correo: "admin@fuma.cl", rol: "admin" };

const PRODUCTOS_DE_PRUEBA = [
  { id: 1, nombre: "Polerón negro", descripcion: "Algodón", precio: 29990, descuentoPorcentaje: 0, idCategoria: "polerones", imagen: "/img/placeholder.svg" },
  { id: 2, nombre: "Gorro de lana", descripcion: "Talla única", precio: 6990, descuentoPorcentaje: 10, idCategoria: "accesorios", imagen: "/img/placeholder.svg" },
];

// Pruebas de la tabla del panel: renderizado, eventos y confirmación antes de eliminar.
describe("TablaProductosAdmin", () => {
  // Renderizado de lista: una fila por producto, más el encabezado.
  it("muestra una fila por producto más el encabezado", () => {
    render(
      <MemoryRouter>
        <TablaProductosAdmin productos={PRODUCTOS_DE_PRUEBA} onEliminar={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getAllByRole("row").length).toBe(PRODUCTOS_DE_PRUEBA.length + 1);
  });

  // Mock de confirm: si el usuario acepta, se llama a onEliminar con el id.
  it("elimina el producto solo cuando el usuario confirma", () => {
    spyOn(window, "confirm").and.returnValue(true);
    const espiaEliminar = jasmine.createSpy("onEliminar");
    render(
      <MemoryRouter>
        <TablaProductosAdmin productos={PRODUCTOS_DE_PRUEBA} onEliminar={espiaEliminar} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(espiaEliminar).toHaveBeenCalledWith(1);
  });

  // Mock de confirm: si el usuario cancela, no se elimina nada.
  it("no elimina el producto cuando el usuario cancela", () => {
    spyOn(window, "confirm").and.returnValue(false);
    const espiaEliminar = jasmine.createSpy("onEliminar");
    render(
      <MemoryRouter>
        <TablaProductosAdmin productos={PRODUCTOS_DE_PRUEBA} onEliminar={espiaEliminar} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(espiaEliminar).not.toHaveBeenCalled();
  });
});

// Pruebas del formulario de producto: validación, edición y datos normalizados.
describe("FormularioProducto", () => {
  // Validación: con campos vacíos se muestran los errores y no se guarda.
  it("muestra errores y no guarda cuando los datos no son válidos", () => {
    const espiaGuardar = jasmine.createSpy("onGuardar");
    render(<FormularioProducto categorias={CATEGORIAS_INICIALES} onGuardar={espiaGuardar} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(espiaGuardar).not.toHaveBeenCalled();
    expect(screen.getByText("Ingresa el nombre del producto.")).toBeTruthy();
    expect(screen.getByText("El precio debe ser un número entero mayor que 0.")).toBeTruthy();
  });

  // Estado inicial al editar: los campos vienen cargados con el producto.
  it("carga los datos del producto al editarlo", () => {
    render(
      <FormularioProducto productoInicial={PRODUCTOS_DE_PRUEBA[0]} categorias={CATEGORIAS_INICIALES} onGuardar={() => {}} />
    );
    expect(screen.getByLabelText("Nombre").value).toBe("Polerón negro");
  });

  // Evento submit: con datos válidos entrega el precio como número.
  it("entrega el precio como número cuando los datos son válidos", () => {
    const espiaGuardar = jasmine.createSpy("onGuardar");
    render(<FormularioProducto categorias={CATEGORIAS_INICIALES} onGuardar={espiaGuardar} />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Gorra negra" } });
    fireEvent.change(screen.getByLabelText("Precio (CLP)"), { target: { value: "7990" } });
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: "accesorios" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(espiaGuardar).toHaveBeenCalledTimes(1);
    expect(espiaGuardar.calls.mostRecent().args[0].precio).toBe(7990);
  });
});

// Pruebas de la protección de rutas del administrador.
describe("RutaAdmin", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function renderizarRutaAdmin() {
    return render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <Routes>
            <Route path="/admin" element={<RutaAdmin><h1>Zona privada</h1></RutaAdmin>} />
            <Route path="/login" element={<h1>Pantalla de ingreso</h1>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  // Renderizado condicional: sin sesión de administrador se redirige al login.
  it("redirige al login cuando no hay sesión de administrador", () => {
    renderizarRutaAdmin();
    expect(screen.getByRole("heading", { name: "Pantalla de ingreso" })).toBeTruthy();
  });

  // Renderizado condicional: con sesión de administrador se muestra la página.
  it("muestra la página cuando el usuario es administrador", () => {
    window.localStorage.setItem(CLAVE_SESION, JSON.stringify(SESION_ADMIN));
    renderizarRutaAdmin();
    expect(screen.getByRole("heading", { name: "Zona privada" })).toBeTruthy();
  });
});

// Pruebas de CRUD de punta a punta desde las páginas del panel.
describe("CRUD de productos desde el panel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(CLAVE_SESION, JSON.stringify(SESION_ADMIN));
  });

  function renderizarPanel(ruta) {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <AuthProvider>
          <Routes>
            <Route path="/admin" element={<RutaAdmin><PaginaAdmin /></RutaAdmin>} />
            <Route path="/admin/productos/nuevo" element={<RutaAdmin><PaginaAdminProductoFormulario /></RutaAdmin>} />
            <Route path="/admin/productos/:id/editar" element={<RutaAdmin><PaginaAdminProductoFormulario /></RutaAdmin>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  // Crear: el producto nuevo se guarda y aparece en la tabla del panel.
  it("crea un producto y lo muestra en el panel", () => {
    renderizarPanel("/admin/productos/nuevo");

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Gorra negra" } });
    fireEvent.change(screen.getByLabelText("Precio (CLP)"), { target: { value: "7990" } });
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: "accesorios" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(screen.getByRole("heading", { name: "Panel de administración" })).toBeTruthy();
    expect(screen.getByText("Gorra negra")).toBeTruthy();
    expect(obtenerProductos().some((producto) => producto.nombre === "Gorra negra")).toBe(true);
  });

  // Actualizar: editar un producto cambia su precio en el almacenamiento.
  it("actualiza el precio de un producto existente", () => {
    renderizarPanel("/admin/productos/1/editar");

    fireEvent.change(screen.getByLabelText("Precio (CLP)"), { target: { value: "19990" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(obtenerProductoPorId(1).precio).toBe(19990);
  });
});
