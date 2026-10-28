import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FormularioCheckout from "../components/FormularioCheckout.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CarritoProvider, useCarrito } from "../context/CarritoContext.jsx";
import { obtenerProductos } from "../data/baseDeDatos.js";
import PaginaAdmin from "../pages/PaginaAdmin.jsx";
import PaginaCompraExitosa from "../pages/PaginaCompraExitosa.jsx";
import PaginaDetalleProducto from "../pages/PaginaDetalleProducto.jsx";
import { CLAVE_CARRITO, CLAVE_SESION } from "../utils/constantes.js";

// Casos límite: ramas alternativas (elementos que no existen, opciones no usadas, acciones secundarias).

// Componente de prueba con botones para las acciones del carrito que no cubren otras pruebas.
function AccionesCarritoDePrueba() {
  const { items, eliminarDelCarrito, vaciarCarrito, cambiarCantidadItem } = useCarrito();
  return (
    <div>
      <p>Productos: {items.length}</p>
      <button type="button" onClick={() => eliminarDelCarrito(3)}>Quitar polera</button>
      <button type="button" onClick={() => cambiarCantidadItem(5, 4)}>Cambiar gorro</button>
      <button type="button" onClick={vaciarCarrito}>Vaciar todo</button>
    </div>
  );
}

describe("CarritoProvider (acciones secundarias)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      CLAVE_CARRITO,
      JSON.stringify([
        { idProducto: 3, nombre: "Polera", imagen: "x.svg", precioUnitario: 9990, cantidad: 1 },
        { idProducto: 5, nombre: "Gorro", imagen: "x.svg", precioUnitario: 6990, cantidad: 1 },
      ])
    );
  });

  it("quita un producto específico del carrito", () => {
    render(<CarritoProvider><AccionesCarritoDePrueba /></CarritoProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Quitar polera" }));
    expect(screen.getByText("Productos: 1")).toBeTruthy();
  });

  it("vacía todo el carrito", () => {
    render(<CarritoProvider><AccionesCarritoDePrueba /></CarritoProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Vaciar todo" }));
    expect(screen.getByText("Productos: 0")).toBeTruthy();
  });

  it("cambia la cantidad de un producto desde el contexto", () => {
    render(<CarritoProvider><AccionesCarritoDePrueba /></CarritoProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar gorro" }));
    const guardado = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO));
    expect(guardado.find((item) => item.idProducto === 5).cantidad).toBe(4);
  });
});

describe("FormularioCheckout (elegir despacho)", () => {
  it("informa el cambio a despacho al elegir la opción de domicilio", () => {
    const espiaEntrega = jasmine.createSpy("onCambiarEntrega");
    render(<FormularioCheckout opcionEntrega="retiro" onCambiarEntrega={espiaEntrega} onConfirmar={() => {}} />);

    fireEvent.click(screen.getByLabelText("Despacho a domicilio"));

    expect(espiaEntrega).toHaveBeenCalledWith("despacho");
  });
});

describe("páginas con datos que no existen", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("muestra 'Producto no encontrado' para un id inexistente", () => {
    render(
      <MemoryRouter initialEntries={["/productos/999"]}>
        <CarritoProvider>
          <Routes>
            <Route path="/productos/:id" element={<PaginaDetalleProducto />} />
          </Routes>
        </CarritoProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Producto no encontrado" })).toBeTruthy();
  });

  it("muestra 'Pedido no encontrado' para un pedido inexistente", () => {
    render(
      <MemoryRouter initialEntries={["/compra-exitosa/999"]}>
        <Routes>
          <Route path="/compra-exitosa/:idPedido" element={<PaginaCompraExitosa />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Pedido no encontrado" })).toBeTruthy();
  });
});

describe("PaginaAdmin (eliminar desde el panel)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(CLAVE_SESION, JSON.stringify({ id: 2, nombre: "Admin", rol: "admin" }));
  });

  // Eliminar confirmado: el producto desaparece de la base de datos y de la tabla.
  it("elimina el producto de la base de datos cuando el usuario confirma", () => {
    spyOn(window, "confirm").and.returnValue(true);
    const cantidadAntes = obtenerProductos().length;

    render(
      <MemoryRouter>
        <AuthProvider>
          <PaginaAdmin />
        </AuthProvider>
      </MemoryRouter>
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(obtenerProductos().length).toBe(cantidadAntes - 1);
    expect(screen.getByText(`${cantidadAntes - 1} productos en el catálogo`)).toBeTruthy();
  });
});
