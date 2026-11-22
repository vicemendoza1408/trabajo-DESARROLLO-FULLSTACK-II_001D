import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BarraNavegacion from "../components/BarraNavegacion.jsx";
import { USUARIO_ADMIN, USUARIO_CLIENTE, USUARIO_VENDEDOR } from "./ayudas.js";

// Pruebas de la barra de navegación: estado del menú, insignia del carrito y eventos.
describe("BarraNavegacion", () => {
  function renderizarBarra(cantidadCarrito = 0) {
    return render(
      <MemoryRouter>
        <BarraNavegacion cantidadCarrito={cantidadCarrito} />
      </MemoryRouter>
    );
  }

  it("muestra la cantidad de ítems del carrito en la insignia", () => {
    renderizarBarra(3);
    expect(screen.getByText("3")).toBeTruthy();
  });

  // Prueba de state y evento: el clic en el botón cambia la clase "show" del menú.
  it("abre y cierra el menú al hacer clic en el botón", () => {
    const { container } = renderizarBarra();
    const boton = screen.getByRole("button", { name: "Abrir menú" });
    const menu = container.querySelector(".navbar-collapse");

    expect(menu.classList.contains("show")).toBe(false);

    fireEvent.click(boton);
    expect(menu.classList.contains("show")).toBe(true);
    expect(boton.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(boton);
    expect(menu.classList.contains("show")).toBe(false);
  });

  it("incluye enlaces a las secciones principales de la tienda", () => {
    renderizarBarra();
    expect(screen.getByRole("link", { name: /Productos/ }).getAttribute("href")).toBe("/productos");
    expect(screen.getByRole("link", { name: /Ofertas/ }).getAttribute("href")).toBe("/ofertas");
  });
});

// Pruebas del menú según el rol. Es solo una conveniencia visual: la seguridad real la hace el backend.
describe("BarraNavegacion según el rol", () => {
  function renderizarConUsuario(usuario, onCerrarSesion = () => {}) {
    return render(
      <MemoryRouter>
        <BarraNavegacion cantidadCarrito={0} usuario={usuario} onCerrarSesion={onCerrarSesion} />
      </MemoryRouter>
    );
  }

  it("ofrece Ingresar cuando no hay sesión", () => {
    renderizarConUsuario(null);

    expect(screen.getByRole("link", { name: "Ingresar" }).getAttribute("href")).toBe("/login");
    expect(screen.queryByRole("button", { name: "Cerrar sesión" })).toBeNull();
  });

  it("muestra la tienda y el nombre del cliente, sin administración ni boletas", () => {
    renderizarConUsuario(USUARIO_CLIENTE);

    expect(screen.getByRole("link", { name: /Carrito/ })).toBeTruthy();
    expect(screen.getByText("Hola, Cliente Demo")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Administración" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Boletas" })).toBeNull();
  });

  // El vendedor solo ve productos (en modo consulta) y boletas: no ve la tienda ni el carrito.
  it("muestra al vendedor solo Productos y Boletas", () => {
    renderizarConUsuario(USUARIO_VENDEDOR);

    expect(screen.getByRole("link", { name: "Productos" }).getAttribute("href")).toBe("/vendedor/productos");
    expect(screen.getByRole("link", { name: "Boletas" }).getAttribute("href")).toBe("/boletas");
    expect(screen.queryByRole("link", { name: /Carrito/ })).toBeNull();
    expect(screen.queryByRole("link", { name: "Ofertas" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Administración" })).toBeNull();
  });

  it("muestra al administrador la tienda, la administración y las boletas", () => {
    renderizarConUsuario(USUARIO_ADMIN);

    expect(screen.getByRole("link", { name: "Administración" }).getAttribute("href")).toBe("/admin");
    expect(screen.getByRole("link", { name: "Boletas" }).getAttribute("href")).toBe("/boletas");
    expect(screen.getByRole("link", { name: /Carrito/ })).toBeTruthy();
  });

  it("llama a onCerrarSesion al pulsar Cerrar sesión", () => {
    const espiaCerrar = jasmine.createSpy("onCerrarSesion");
    renderizarConUsuario(USUARIO_CLIENTE, espiaCerrar);

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(espiaCerrar).toHaveBeenCalledTimes(1);
  });
});
