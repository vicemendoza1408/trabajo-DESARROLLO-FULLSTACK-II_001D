import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import { CLAVE_TOKEN } from "../utils/constantes.js";
import { BOLETA, CATEGORIAS, PRODUCTOS, USUARIO_ADMIN, USUARIO_CLIENTE, USUARIO_VENDEDOR, ok, simularApi } from "./ayudas.js";

// Pruebas de rutas: la aplicación muestra la página correcta según la URL y el rol de la sesión.
describe("rutas de la aplicación", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // Renderiza la aplicación completa en una ruta. Si se indica un usuario, simula que ya tenía la sesión
  // iniciada (token guardado) y que el backend lo reconoce en GET /auth/me.
  function renderizarEn(ruta, usuario = null) {
    if (usuario !== null) {
      window.localStorage.setItem(CLAVE_TOKEN, "token-de-prueba");
    }
    simularApi({
      "GET /auth/me": ok(usuario),
      "GET /productos": ok(PRODUCTOS),
      "GET /productos/3": ok(PRODUCTOS[2]),
      "GET /categorias": ok(CATEGORIAS),
      "GET /boletas": ok([BOLETA]),
    });
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <AuthProvider>
          <CarritoProvider>
            <App />
          </CarritoProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  // Rutas públicas.
  it("muestra el producto que corresponde al id de la URL", async () => {
    renderizarEn("/productos/3");

    expect(await screen.findByRole("heading", { name: "Gorro de lana" })).toBeTruthy();
  });

  it("muestra la página de no encontrada para una ruta inexistente", () => {
    renderizarEn("/ruta-que-no-existe");

    expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeTruthy();
  });

  // Rutas protegidas: sin sesión se envía al login.
  it("envía al login a quien entra al panel de administración sin sesión", () => {
    renderizarEn("/admin");

    expect(screen.getByRole("heading", { name: "Ingresar" })).toBeTruthy();
  });

  it("envía al login a quien entra al checkout sin sesión", () => {
    renderizarEn("/checkout");

    expect(screen.getByRole("heading", { name: "Ingresar" })).toBeTruthy();
  });

  // Cliente: solo la tienda.
  it("muestra 'Sin permiso' al cliente que entra al panel de administración", async () => {
    renderizarEn("/admin", USUARIO_CLIENTE);

    expect(await screen.findByRole("heading", { name: "Sin permiso" })).toBeTruthy();
  });

  it("muestra 'Sin permiso' al cliente que entra a la lista de boletas", async () => {
    renderizarEn("/boletas", USUARIO_CLIENTE);

    expect(await screen.findByRole("heading", { name: "Sin permiso" })).toBeTruthy();
  });

  // Vendedor: productos y boletas en modo consulta; no compra ni administra.
  it("muestra la lista de boletas al vendedor", async () => {
    renderizarEn("/boletas", USUARIO_VENDEDOR);

    expect(await screen.findByText("Cliente Demo")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Boletas" })).toBeTruthy();
  });

  it("muestra los productos en modo consulta al vendedor", async () => {
    renderizarEn("/vendedor/productos", USUARIO_VENDEDOR);

    expect(await screen.findByText("Cinturón de cuero")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Eliminar" })).toBeNull();
  });

  it("muestra 'Sin permiso' al vendedor que entra al checkout", async () => {
    renderizarEn("/checkout", USUARIO_VENDEDOR);

    expect(await screen.findByRole("heading", { name: "Sin permiso" })).toBeTruthy();
  });

  it("muestra 'Sin permiso' al vendedor que entra al panel de administración", async () => {
    renderizarEn("/admin", USUARIO_VENDEDOR);

    expect(await screen.findByRole("heading", { name: "Sin permiso" })).toBeTruthy();
  });

  // Administrador: acceso completo.
  it("muestra el panel de administración al administrador", async () => {
    renderizarEn("/admin", USUARIO_ADMIN);

    expect(await screen.findByRole("heading", { name: "Panel de administración" })).toBeTruthy();
  });

  // Persistencia: con el token guardado, al recargar se mantiene la sesión y el menú del rol.
  it("mantiene la sesión al recargar y muestra el nombre del usuario en la barra", async () => {
    renderizarEn("/", USUARIO_ADMIN);

    expect(await screen.findByText("Hola, Administrador Fuma")).toBeTruthy();
  });
});
