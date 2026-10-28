import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import PaginaCategorias from "../pages/PaginaCategorias.jsx";
import PaginaOfertas from "../pages/PaginaOfertas.jsx";
import PaginaProductos from "../pages/PaginaProductos.jsx";

// Pruebas de las páginas del catálogo: búsqueda, categorías y ofertas.
// Los datos vienen de la semilla: 8 productos, 4 de ellos con descuento.
function contarTarjetas() {
  return screen.queryAllByRole("button", { name: "Agregar" }).length;
}

describe("PaginaProductos", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // Estado + evento: escribir en la búsqueda filtra el catálogo en pantalla.
  it("filtra los productos según el texto buscado", () => {
    render(
      <MemoryRouter>
        <CarritoProvider>
          <PaginaProductos />
        </CarritoProvider>
      </MemoryRouter>
    );
    expect(contarTarjetas()).toBe(8);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "gorro" } });

    expect(contarTarjetas()).toBe(1);
    expect(screen.getByRole("heading", { name: "Gorro de lana" })).toBeTruthy();
  });
});

describe("PaginaCategorias", () => {
  // Ruta con parámetro: /categorias/accesorios muestra solo los productos de esa categoría.
  it("muestra solo los productos de la categoría de la URL", () => {
    render(
      <MemoryRouter initialEntries={["/categorias/accesorios"]}>
        <CarritoProvider>
          <Routes>
            <Route path="/categorias/:idCategoria" element={<PaginaCategorias />} />
          </Routes>
        </CarritoProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Accesorios" })).toBeTruthy();
    expect(contarTarjetas()).toBe(2);
  });
});

describe("PaginaOfertas", () => {
  // Filtro de ofertas: solo aparecen los productos con descuento.
  it("muestra únicamente los productos que tienen descuento", () => {
    render(
      <MemoryRouter>
        <CarritoProvider>
          <PaginaOfertas />
        </CarritoProvider>
      </MemoryRouter>
    );
    expect(contarTarjetas()).toBe(4);
  });
});
