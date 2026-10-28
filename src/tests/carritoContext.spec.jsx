import { fireEvent, render, screen } from "@testing-library/react";
import { CarritoProvider, useCarrito } from "../context/CarritoContext.jsx";
import { CLAVE_CARRITO } from "../utils/constantes.js";

// Componente de prueba: muestra el contador y tiene un botón para agregar un producto.
function ContadorDePrueba() {
  const { cantidadTotal, agregarAlCarrito } = useCarrito();
  const polera = { id: 3, nombre: "Polera", precio: 9990, descuentoPorcentaje: 0, imagen: "x.svg" };
  return (
    <div>
      <p>Cantidad: {cantidadTotal}</p>
      <button type="button" onClick={() => agregarAlCarrito(polera)}>
        Agregar
      </button>
    </div>
  );
}

// Pruebas del estado global del carrito: cambios en la interfaz y persistencia.
describe("CarritoProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // State + evento: agregar un producto actualiza el contador en pantalla.
  it("aumenta el contador al agregar un producto", () => {
    render(
      <CarritoProvider>
        <ContadorDePrueba />
      </CarritoProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));
    expect(screen.getByText("Cantidad: 1")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));
    expect(screen.getByText("Cantidad: 2")).toBeTruthy();
  });

  // Persistencia: al agregar, el carrito queda guardado en localStorage.
  it("guarda el carrito en localStorage al agregar un producto", () => {
    render(
      <CarritoProvider>
        <ContadorDePrueba />
      </CarritoProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

    const guardado = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO));
    expect(guardado.length).toBe(1);
    expect(guardado[0].cantidad).toBe(1);
  });

  // Persistencia: al cargar, se restaura el carrito que estaba guardado.
  it("restaura el carrito guardado al iniciar", () => {
    window.localStorage.setItem(
      CLAVE_CARRITO,
      JSON.stringify([{ idProducto: 3, nombre: "Polera", imagen: "x.svg", precioUnitario: 9990, cantidad: 2 }])
    );

    render(
      <CarritoProvider>
        <ContadorDePrueba />
      </CarritoProvider>
    );

    expect(screen.getByText("Cantidad: 2")).toBeTruthy();
  });
});
