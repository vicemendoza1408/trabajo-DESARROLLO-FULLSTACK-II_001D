import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PaginaVendedorProductoDetalle from "../pages/PaginaVendedorProductoDetalle.jsx";
import PaginaVendedorProductos from "../pages/PaginaVendedorProductos.jsx";
import { CATEGORIAS, PRODUCTOS, fallo, ok, simularApi } from "./ayudas.js";

// Pruebas de la vista del vendedor: puede consultar productos, pero no modificarlos ni comprarlos.
describe("PaginaVendedorProductos", () => {
  function renderizarLista() {
    return render(
      <MemoryRouter>
        <PaginaVendedorProductos />
      </MemoryRouter>
    );
  }

  it("muestra el catálogo en modo consulta, sin botones de editar ni eliminar", async () => {
    simularApi({ "GET /productos": ok(PRODUCTOS), "GET /categorias": ok(CATEGORIAS) });
    renderizarLista();

    expect(await screen.findByText("Gorro de lana")).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBe(PRODUCTOS.length + 1);
    expect(screen.queryByRole("button", { name: "Eliminar" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Editar" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "Ver detalle" }).length).toBe(PRODUCTOS.length);
  });

  it("muestra un aviso cuando el backend falla", async () => {
    simularApi({
      "GET /productos": fallo(500, "Error interno del servidor."),
      "GET /categorias": ok(CATEGORIAS),
    });
    renderizarLista();

    expect((await screen.findByRole("alert")).textContent).toBe("Error interno del servidor.");
  });
});

describe("PaginaVendedorProductoDetalle", () => {
  function renderizarDetalle(id) {
    return render(
      <MemoryRouter initialEntries={[`/vendedor/productos/${id}`]}>
        <Routes>
          <Route path="/vendedor/productos/:id" element={<PaginaVendedorProductoDetalle />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("muestra la información del producto sin botón de compra", async () => {
    simularApi({ "GET /productos/3": ok(PRODUCTOS[2]) });
    renderizarDetalle(3);

    expect(await screen.findByRole("heading", { name: "Gorro de lana" })).toBeTruthy();
    expect(screen.getByText("Talla única")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Agregar al carrito" })).toBeNull();
    expect(screen.getByRole("link", { name: "← Volver a productos" }).getAttribute("href")).toBe("/vendedor/productos");
  });

  it("muestra el aviso cuando el producto no existe", async () => {
    simularApi({ "GET /productos/999": fallo(404, "Producto no encontrado.") });
    renderizarDetalle(999);

    expect((await screen.findByRole("alert")).textContent).toBe("Producto no encontrado.");
  });
});
