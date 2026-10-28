import { fireEvent, render, screen } from "@testing-library/react";
import BarraBusqueda from "../components/BarraBusqueda.jsx";
import ListaProductos from "../components/ListaProductos.jsx";
import PrecioProducto from "../components/PrecioProducto.jsx";
import TarjetaProducto from "../components/TarjetaProducto.jsx";
import { formatearPrecio } from "../utils/precios.js";

// Pruebas de componentes de catálogo: renderizado, condicionales, props y eventos.
const productoSinDescuento = {
  id: 3,
  nombre: "Polera blanca básica",
  descripcion: "Algodón 100%.",
  precio: 9990,
  descuentoPorcentaje: 0,
  imagen: "/img/placeholder.svg",
};

describe("TarjetaProducto", () => {
  // Renderizado: muestra nombre, precio e imagen con texto alternativo.
  it("muestra nombre, precio e imagen del producto", () => {
    render(<TarjetaProducto producto={productoSinDescuento} onAgregarAlCarrito={() => {}} />);

    expect(screen.getByText("Polera blanca básica")).toBeTruthy();
    expect(screen.getByText(formatearPrecio(9990))).toBeTruthy();
    expect(screen.getByAltText("Polera blanca básica")).toBeTruthy();
  });

  // Evento con spy: el clic en "Agregar" llama a la función con el producto.
  it("llama a onAgregarAlCarrito con el producto al pulsar Agregar", () => {
    const espiaAgregar = jasmine.createSpy("onAgregarAlCarrito");
    render(<TarjetaProducto producto={productoSinDescuento} onAgregarAlCarrito={espiaAgregar} />);

    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    expect(espiaAgregar).toHaveBeenCalledOnceWith(productoSinDescuento);
  });
});

describe("PrecioProducto", () => {
  // Renderizado condicional: sin descuento solo aparece el precio normal.
  it("muestra un único precio cuando no hay descuento", () => {
    const { container } = render(<PrecioProducto precio={9990} descuentoPorcentaje={0} />);
    expect(container.querySelector("s")).toBeNull();
    expect(screen.getByText(formatearPrecio(9990))).toBeTruthy();
  });

  // Renderizado condicional: con descuento aparecen el original tachado y el precio final.
  it("muestra el precio original tachado y el final cuando hay descuento", () => {
    const { container } = render(<PrecioProducto precio={10000} descuentoPorcentaje={20} />);
    expect(container.querySelector("s").textContent).toBe(formatearPrecio(10000));
    expect(screen.getByText(formatearPrecio(8000))).toBeTruthy();
  });
});

describe("ListaProductos", () => {
  // Renderizado de lista: una tarjeta por cada producto.
  it("renderiza una tarjeta por cada producto", () => {
    const productos = [
      productoSinDescuento,
      { ...productoSinDescuento, id: 4, nombre: "Polera estampada" },
      { ...productoSinDescuento, id: 5, nombre: "Gorro" },
    ];
    render(<ListaProductos productos={productos} onAgregarAlCarrito={() => {}} />);

    expect(screen.getAllByRole("button", { name: "Agregar" }).length).toBe(3);
  });

  // Renderizado condicional: sin productos se muestra el mensaje y ninguna tarjeta.
  it("muestra un mensaje y ninguna tarjeta cuando la lista está vacía", () => {
    render(<ListaProductos productos={[]} onAgregarAlCarrito={() => {}} />);

    expect(screen.getByText(/No hay productos/)).toBeTruthy();
    expect(screen.queryAllByRole("button", { name: "Agregar" }).length).toBe(0);
  });
});

describe("BarraBusqueda", () => {
  // Evento de formulario: escribir llama a onCambiar con el texto nuevo.
  it("informa el texto escrito por el usuario", () => {
    const espiaCambio = jasmine.createSpy("onCambiar");
    render(<BarraBusqueda valor="" onCambiar={espiaCambio} />);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "polera" } });

    expect(espiaCambio).toHaveBeenCalledWith("polera");
  });
});
