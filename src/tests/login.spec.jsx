import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AlertaMensaje from "../components/AlertaMensaje.jsx";
import CampoFormulario from "../components/CampoFormulario.jsx";
import FormularioLogin from "../components/FormularioLogin.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import PaginaLogin from "../pages/PaginaLogin.jsx";
import { CLAVE_TOKEN } from "../utils/constantes.js";
import { USUARIO_ADMIN, USUARIO_CLIENTE, USUARIO_VENDEDOR, fallo, llamadasA, ok, simularApi } from "./ayudas.js";

// Pruebas del formulario de inicio de sesión: estado, eventos, validación y mensajes.
describe("CampoFormulario", () => {
  // Renderizado condicional: el mensaje de error solo aparece cuando existe.
  it("muestra el mensaje de error solo cuando hay un error", () => {
    const { rerender } = render(
      <CampoFormulario etiqueta="Correo" nombre="correo" valor="" onCambiar={() => {}} />
    );
    expect(document.querySelector(".invalid-feedback")).toBeNull();

    rerender(
      <CampoFormulario etiqueta="Correo" nombre="correo" valor="" error="Ingresa un correo." onCambiar={() => {}} />
    );
    expect(screen.getByText("Ingresa un correo.")).toBeTruthy();
  });
});

describe("AlertaMensaje", () => {
  // Renderizado: la alerta muestra el mensaje con el rol correcto para accesibilidad.
  it("muestra el mensaje dentro de una alerta", () => {
    render(<AlertaMensaje tipo="danger" mensaje="Algo salió mal." />);
    expect(screen.getByRole("alert").textContent).toBe("Algo salió mal.");
  });
});

describe("FormularioLogin", () => {
  // State: lo que el usuario escribe se refleja en los campos.
  it("actualiza los campos a medida que el usuario escribe", () => {
    render(<FormularioLogin onIniciarSesion={() => {}} />);

    const campoCorreo = screen.getByLabelText("Correo");
    fireEvent.change(campoCorreo, { target: { value: "cliente@fuma.cl" } });

    expect(campoCorreo.value).toBe("cliente@fuma.cl");
  });

  // Evento submit: envía el correo y la contraseña escritos.
  it("entrega el correo y la contraseña al enviar", () => {
    const espia = jasmine.createSpy("onIniciarSesion");
    render(<FormularioLogin onIniciarSesion={espia} />);

    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "admin@fuma.cl" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(espia).toHaveBeenCalledWith("admin@fuma.cl", "admin123");
  });
});

describe("PaginaLogin", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // Muestra el login y, además, las páginas a las que puede llevar según el rol.
  function renderizarLogin(entrada = "/login") {
    return render(
      <MemoryRouter initialEntries={[entrada]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<PaginaLogin />} />
            <Route path="/" element={<h1>Tienda</h1>} />
            <Route path="/admin" element={<h1>Panel de administración</h1>} />
            <Route path="/boletas" element={<h1>Boletas</h1>} />
            <Route path="/checkout" element={<h1>Finalizar compra</h1>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  function ingresar(correo, contrasena) {
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: correo } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: contrasena } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  }

  // Validación: con campos vacíos muestra un aviso y ni siquiera consulta al backend.
  it("muestra un aviso cuando los campos están vacíos", () => {
    const espia = simularApi({});
    renderizarLogin();

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByRole("alert").textContent).toBe("Completa el correo y la contraseña.");
    expect(espia).not.toHaveBeenCalled();
  });

  // Error del backend: el mensaje del 401 se muestra y no se guarda ningún token.
  it("muestra el error del backend con credenciales incorrectas", async () => {
    simularApi({ "POST /auth/login": fallo(401, "Correo o contraseña incorrectos.") });
    renderizarLogin();

    ingresar("cliente@fuma.cl", "mala");

    expect((await screen.findByRole("alert")).textContent).toBe("Correo o contraseña incorrectos.");
    expect(window.localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it("muestra un aviso cuando el backend no responde", async () => {
    spyOn(window, "fetch").and.callFake(() => Promise.reject(new TypeError("Failed to fetch")));
    renderizarLogin();

    ingresar("cliente@fuma.cl", "cliente123");

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudo conectar con el servidor");
  });

  // Login correcto: se envían las credenciales, se guarda el token y cada rol va a su página.
  it("envía las credenciales y guarda el token al iniciar sesión", async () => {
    const espia = simularApi({ "POST /auth/login": ok({ token: "token-cliente", usuario: USUARIO_CLIENTE }) });
    renderizarLogin();

    ingresar("cliente@fuma.cl", "cliente123");
    await screen.findByRole("heading", { name: "Tienda" });

    expect(llamadasA(espia, "POST /auth/login")[0].cuerpo).toEqual({ correo: "cliente@fuma.cl", contrasena: "cliente123" });
    expect(window.localStorage.getItem(CLAVE_TOKEN)).toBe("token-cliente");
  });

  it("lleva al administrador al panel", async () => {
    simularApi({ "POST /auth/login": ok({ token: "t", usuario: USUARIO_ADMIN }) });
    renderizarLogin();

    ingresar("admin@fuma.cl", "admin123");

    expect(await screen.findByRole("heading", { name: "Panel de administración" })).toBeTruthy();
  });

  it("lleva al vendedor a las boletas", async () => {
    simularApi({ "POST /auth/login": ok({ token: "t", usuario: USUARIO_VENDEDOR }) });
    renderizarLogin();

    ingresar("vendedor@fuma.cl", "vendedor123");

    expect(await screen.findByRole("heading", { name: "Boletas" })).toBeTruthy();
  });

  // Si la persona venía de una página protegida, vuelve a ella después de iniciar sesión.
  it("vuelve a la página protegida de la que venía el usuario", async () => {
    simularApi({ "POST /auth/login": ok({ token: "t", usuario: USUARIO_CLIENTE }) });
    renderizarLogin({ pathname: "/login", state: { desde: "/checkout" } });

    ingresar("cliente@fuma.cl", "cliente123");

    expect(await screen.findByRole("heading", { name: "Finalizar compra" })).toBeTruthy();
  });
});
