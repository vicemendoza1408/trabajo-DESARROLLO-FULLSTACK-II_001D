import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ItemCarrito from "../components/ItemCarrito.jsx";
import ResumenPedido from "../components/ResumenPedido.jsx";
import SelectorCantidad from "../components/SelectorCantidad.jsx";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import PaginaCarrito from "../pages/PaginaCarrito.jsx";
import { CLAVE_CARRITO } from "../utils/constantes.js";
import { formatearPrecio } from "../utils/precios.js";

// Pruebas de la interfaz del carrito: selector, ítem, resumen y página completa.
describe("SelectorCantidad", () => {
  // Evento: el botón + informa la cantidad siguiente.
  it("informa cantidad + 1 al pulsar +", () => {
    const espia = jasmine.createSpy("onCambiar");
    render(<SelectorCantidad cantidad={2} onCambiar={espia} />);

    fireEvent.click(screen.getByRole("button", { name: "Aumentar cantidad" }));

    expect(espia).toHaveBeenCalledWith(3);
  });

  // Renderizado condicional: con cantidad 1, el botón − está deshabilitado.
  it("deshabilita el botón − cuando la cantidad es 1", () => {
    render(<SelectorCantidad cantidad={1} onCambiar={() => {}} />);
    expect(screen.getByRole("button", { name: "Disminuir cantidad" }).disabled).toBe(true);
  });
});

describe("ItemCarrito", () => {
  const item = { idProducto: 3, nombre: "Polera blanca", imagen: "x.svg", precioUnitario: 9990, cantidad: 2 };

  // Renderizado: el subtotal de la línea es precio unitario por cantidad.
  it("muestra el subtotal de la línea (precio por cantidad)", () => {
    render(<ItemCarrito item={item} onCambiarCantidad={() => {}} onEliminar={() => {}} />);
    expect(screen.getByText(formatearPrecio(9990 * 2))).toBeTruthy();
  });

  // Evento con props: eliminar informa el id del producto.
  it("llama a onEliminar con el id del producto", () => {
    const espiaEliminar = jasmine.createSpy("onEliminar");
    render(<ItemCarrito item={item} onCambiarCantidad={() => {}} onEliminar={espiaEliminar} />);

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(espiaEliminar).toHaveBeenCalledWith(3);
  });
});

describe("ResumenPedido", () => {
  // Renderizado condicional: sin envío conocido no aparece el total.
  it("no muestra total cuando el despacho aún no se conoce", () => {
    render(<ResumenPedido subtotal={10000} />);
    expect(screen.queryByText("Total")).toBeNull();
    expect(screen.getByText(/se calcula al finalizar/)).toBeTruthy();
  });

  // Renderizado con props: con envío conocido muestra el total.
  it("muestra el total cuando se informa el costo de envío", () => {
    render(<ResumenPedido subtotal={10000} costoEnvio={3990} total={13990} />);
    expect(screen.getByText(formatearPrecio(13990))).toBeTruthy();
  });
});

describe("PaginaCarrito", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function renderizarCarrito() {
    return render(
      <MemoryRouter>
        <CarritoProvider>
          <PaginaCarrito />
        </CarritoProvider>
      </MemoryRouter>
    );
  }

  // Renderizado condicional: carrito vacío muestra el mensaje y no el resumen.
  it("muestra un mensaje cuando el carrito está vacío", () => {
    renderizarCarrito();
    expect(screen.getByRole("heading", { name: "Tu carrito está vacío" })).toBeTruthy();
  });

  // Estado + evento: el carrito guardado se muestra y "Vaciar carrito" lo deja vacío.
  it("muestra los productos guardados y los vacía al pulsar Vaciar carrito", () => {
    window.localStorage.setItem(
      CLAVE_CARRITO,
      JSON.stringify([{ idProducto: 3, nombre: "Polera blanca", imagen: "x.svg", precioUnitario: 9990, cantidad: 1 }])
    );
    renderizarCarrito();

    expect(screen.getByRole("heading", { name: "Polera blanca" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Vaciar carrito" }));

    expect(screen.getByRole("heading", { name: "Tu carrito está vacío" })).toBeTruthy();
  });
});
