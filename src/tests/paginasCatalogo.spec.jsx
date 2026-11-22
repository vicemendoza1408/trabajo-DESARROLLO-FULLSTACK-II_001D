import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import PaginaCategorias from "../pages/PaginaCategorias.jsx";
import PaginaDetalleProducto from "../pages/PaginaDetalleProducto.jsx";
import PaginaOfertas from "../pages/PaginaOfertas.jsx";
import PaginaProductos from "../pages/PaginaProductos.jsx";
import { CLAVE_CARRITO } from "../utils/constantes.js";
import { CATEGORIAS, PRODUCTOS, fallo, llamadasA, ok, respuestaPendiente, simularApi } from "./ayudas.js";

// Pruebas de las páginas del catálogo. Los productos llegan desde la API (aquí simulada con 4 productos).
function contarTarjetas() {
  return screen.queryAllByRole("button", { name: "Agregar" }).length;
}

describe("PaginaProductos", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function renderizarProductos() {
    return render(
      <MemoryRouter>
        <CarritoProvider>
          <PaginaProductos />
        </CarritoProvider>
      </MemoryRouter>
    );
  }

  // Carga desde la API: se muestra "Cargando..." y luego una tarjeta por producto.
  it("muestra los productos que entrega la API", async () => {
    const espia = simularApi({ "GET /productos": ok(PRODUCTOS) });
    renderizarProductos();

    expect(screen.getByText("Cargando...")).toBeTruthy();
    expect(await screen.findByRole("heading", { name: "Gorro de lana" })).toBeTruthy();

    expect(contarTarjetas()).toBe(PRODUCTOS.length);
    expect(llamadasA(espia, "GET /productos").length).toBe(1);
  });

  // Estado + evento: escribir en la búsqueda filtra la lista que ya llegó (sin volver a pedir a la API).
  it("filtra los productos según el texto buscado", async () => {
    const espia = simularApi({ "GET /productos": ok(PRODUCTOS) });
    renderizarProductos();
    await screen.findByRole("heading", { name: "Gorro de lana" });

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "gorro" } });

    expect(contarTarjetas()).toBe(1);
    expect(screen.getByRole("heading", { name: "Gorro de lana" })).toBeTruthy();
    expect(llamadasA(espia, "GET /productos").length).toBe(1);
  });

  // Error: si el backend falla, se muestra el aviso en lugar de la lista.
  it("muestra un aviso cuando el backend responde con un error", async () => {
    simularApi({ "GET /productos": fallo(500, "Error interno del servidor.") });
    renderizarProductos();

    expect((await screen.findByRole("alert")).textContent).toBe("Error interno del servidor.");
    expect(contarTarjetas()).toBe(0);
  });

  it("muestra un aviso cuando el backend está apagado", async () => {
    spyOn(window, "fetch").and.callFake(() => Promise.reject(new TypeError("Failed to fetch")));
    renderizarProductos();

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudo conectar con el servidor");
  });

  // Carrito: agregar un producto desde la lista lo guarda en el carrito.
  it("agrega un producto al carrito al pulsar Agregar", async () => {
    simularApi({ "GET /productos": ok(PRODUCTOS) });
    renderizarProductos();
    await screen.findByRole("heading", { name: "Gorro de lana" });

    fireEvent.click(screen.getAllByRole("button", { name: "Agregar" })[0]);

    const guardado = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO));
    expect(guardado.length).toBe(1);
    expect(guardado[0].idProducto).toBe(1);
  });
});

describe("PaginaCategorias", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // Ruta con parámetro: /categorias/accesorios pide a la API solo los productos de esa categoría.
  it("muestra solo los productos de la categoría de la URL", async () => {
    const accesorios = PRODUCTOS.filter((producto) => producto.idCategoria === "accesorios");
    const espia = simularApi({
      "GET /categorias": ok(CATEGORIAS),
      "GET /productos?idCategoria=accesorios": ok(accesorios),
    });
    render(
      <MemoryRouter initialEntries={["/categorias/accesorios"]}>
        <CarritoProvider>
          <Routes>
            <Route path="/categorias/:idCategoria" element={<PaginaCategorias />} />
          </Routes>
        </CarritoProvider>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Accesorios" })).toBeTruthy();
    expect(contarTarjetas()).toBe(2);
    expect(llamadasA(espia, "GET /productos?idCategoria=accesorios").length).toBe(1);
  });
});

describe("PaginaOfertas", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // Filtro de ofertas: lo hace el backend (?ofertas=true) y la página muestra lo que llega.
  it("muestra únicamente los productos que entrega la API como ofertas", async () => {
    const ofertas = PRODUCTOS.filter((producto) => producto.descuentoPorcentaje > 0);
    const espia = simularApi({ "GET /productos?ofertas=true": ok(ofertas) });
    render(
      <MemoryRouter>
        <CarritoProvider>
          <PaginaOfertas />
        </CarritoProvider>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "Polera blanca" })).toBeTruthy();
    expect(contarTarjetas()).toBe(2);
    expect(llamadasA(espia, "GET /productos?ofertas=true").length).toBe(1);
  });
});

describe("PaginaDetalleProducto", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function renderizarDetalle(id) {
    return render(
      <MemoryRouter initialEntries={[`/productos/${id}`]}>
        <CarritoProvider>
          <Routes>
            <Route path="/productos/:id" element={<PaginaDetalleProducto />} />
          </Routes>
        </CarritoProvider>
      </MemoryRouter>
    );
  }

  it("muestra el producto que corresponde al id de la URL", async () => {
    const espia = simularApi({ "GET /productos/3": ok(PRODUCTOS[2]) });
    renderizarDetalle(3);

    expect(await screen.findByRole("heading", { name: "Gorro de lana" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Agregar al carrito" })).toBeTruthy();
    expect(llamadasA(espia, "GET /productos/3").length).toBe(1);
  });

  it("muestra 'Producto no encontrado' cuando el backend responde 404", async () => {
    simularApi({ "GET /productos/999": fallo(404, "Producto no encontrado.") });
    renderizarDetalle(999);

    expect(await screen.findByRole("heading", { name: "Producto no encontrado" })).toBeTruthy();
  });

  it("muestra 'Cargando...' mientras espera la respuesta", () => {
    simularApi({ "GET /productos/3": respuestaPendiente() });
    renderizarDetalle(3);

    expect(screen.getByText("Cargando...")).toBeTruthy();
  });
});
