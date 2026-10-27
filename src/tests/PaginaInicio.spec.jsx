import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PaginaInicio from "../pages/PaginaInicio.jsx";

// Prueba de renderizado: la página muestra el nombre de la tienda.
describe("PaginaInicio", () => {
  it("muestra el nombre de la tienda", () => {
    render(
      <MemoryRouter>
        <PaginaInicio />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Fuma" })).toBeTruthy();
  });
});
