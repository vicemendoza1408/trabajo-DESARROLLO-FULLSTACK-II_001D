import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RutaProtegida from "../components/RutaProtegida.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CLAVE_TOKEN, ROLES } from "../utils/constantes.js";
import { rutaInicioPorRol } from "../utils/roles.js";
import { USUARIO_ADMIN, USUARIO_CLIENTE, USUARIO_VENDEDOR, fallo, ok, respuestaPendiente, simularApi } from "./ayudas.js";

// Renderiza una página que solo puede ver el ADMIN. Si hay un usuario, simula que el token guardado es suyo.
function renderizarZonaPrivada(respuestaMe) {
  if (respuestaMe !== undefined) {
    window.localStorage.setItem(CLAVE_TOKEN, "token-de-prueba");
    simularApi({ "GET /auth/me": respuestaMe });
  } else {
    simularApi({});
  }
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<RutaProtegida roles={[ROLES.ADMIN]}><h1>Zona privada</h1></RutaProtegida>} />
          <Route path="/login" element={<h1>Pantalla de ingreso</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

// Pruebas de la protección de rutas por rol (lo que se oculta en la interfaz).
// La seguridad real la hace el backend con 401 y 403; esto solo decide qué se muestra.
describe("RutaProtegida", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("redirige al login cuando no hay sesión", () => {
    renderizarZonaPrivada();

    expect(screen.getByRole("heading", { name: "Pantalla de ingreso" })).toBeTruthy();
  });

  it("muestra la página cuando el rol del usuario está permitido", async () => {
    renderizarZonaPrivada(ok(USUARIO_ADMIN));

    expect(await screen.findByRole("heading", { name: "Zona privada" })).toBeTruthy();
  });

  it("muestra 'Sin permiso' cuando el usuario tiene otro rol", async () => {
    renderizarZonaPrivada(ok(USUARIO_CLIENTE));

    expect(await screen.findByRole("heading", { name: "Sin permiso" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Zona privada" })).toBeNull();
  });

  // Al recargar con un token guardado, no se debe enviar al login mientras el backend aún responde.
  it("espera la respuesta del backend antes de decidir, sin enviar al login", () => {
    renderizarZonaPrivada(respuestaPendiente());

    expect(screen.getByText("Comprobando sesión...")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Pantalla de ingreso" })).toBeNull();
  });

  it("redirige al login cuando el token guardado ya no es válido", async () => {
    renderizarZonaPrivada(fallo(401, "Sesión expirada."));

    expect(await screen.findByRole("heading", { name: "Pantalla de ingreso" })).toBeTruthy();
  });
});

// Pruebas de la página "Sin permiso": el enlace de vuelta depende del rol.
describe("PaginaSinPermiso", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lleva al vendedor de vuelta a las boletas", async () => {
    renderizarZonaPrivada(ok(USUARIO_VENDEDOR));

    const enlace = await screen.findByRole("link", { name: "Volver al inicio" });

    expect(enlace.getAttribute("href")).toBe("/boletas");
  });
});

// Página de inicio de cada rol después de iniciar sesión.
describe("rutaInicioPorRol", () => {
  it("lleva al administrador al panel", () => {
    expect(rutaInicioPorRol(ROLES.ADMIN)).toBe("/admin");
  });

  it("lleva al vendedor a las boletas", () => {
    expect(rutaInicioPorRol(ROLES.VENDEDOR)).toBe("/boletas");
  });

  it("lleva al cliente (y a quien no tiene rol) a la tienda", () => {
    expect(rutaInicioPorRol(ROLES.CLIENTE)).toBe("/");
    expect(rutaInicioPorRol(undefined)).toBe("/");
  });
});
