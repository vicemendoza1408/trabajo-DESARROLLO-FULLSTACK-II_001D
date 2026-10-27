import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BarraNavegacion from "../components/BarraNavegacion.jsx";

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
