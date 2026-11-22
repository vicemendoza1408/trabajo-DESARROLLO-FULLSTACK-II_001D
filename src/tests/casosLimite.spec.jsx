import { fireEvent, render, screen } from "@testing-library/react";
import FormularioCheckout from "../components/FormularioCheckout.jsx";
import { CarritoProvider, useCarrito } from "../context/CarritoContext.jsx";
import { CLAVE_CARRITO } from "../utils/constantes.js";

// Casos límite: acciones secundarias del carrito y opciones del checkout que otras pruebas no recorren.
// (Los casos de "no encontrado", error de la API y acceso denegado están en las pruebas de cada página.)

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
