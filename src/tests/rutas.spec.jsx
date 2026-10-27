import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";

// Pruebas de rutas: la aplicación muestra la página correcta según la URL.
describe("rutas de la aplicación", () => {
  function renderizarEn(ruta) {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <App />
      </MemoryRouter>
    );
  }

  it("muestra el id del producto que viene en la URL", () => {
    renderizarEn("/productos/7");
    expect(screen.getByRole("heading", { name: "Producto 7" })).toBeTruthy();
  });

  it("muestra la página de no encontrada para una ruta inexistente", () => {
    renderizarEn("/ruta-que-no-existe");
    expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeTruthy();
  });
});
