import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";
import { CarritoProvider } from "../context/CarritoContext.jsx";

// Pruebas de rutas: la aplicación muestra la página correcta según la URL.
describe("rutas de la aplicación", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function renderizarEn(ruta) {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </MemoryRouter>
    );
  }

  it("muestra el producto que corresponde al id de la URL", () => {
    renderizarEn("/productos/7");
    expect(screen.getByRole("heading", { name: "Gorro de lana" })).toBeTruthy();
  });

  it("muestra la página de no encontrada para una ruta inexistente", () => {
    renderizarEn("/ruta-que-no-existe");
    expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeTruthy();
  });
});
