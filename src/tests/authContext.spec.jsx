import { act, fireEvent, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext.jsx";
import { CLAVE_TOKEN, EVENTO_SESION_EXPIRADA, MINUTOS_RENOVACION_TOKEN } from "../utils/constantes.js";
import { USUARIO_ADMIN, USUARIO_CLIENTE, esperarHasta, fallo, llamadasA, ok, simularApi } from "./ayudas.js";

// Componente de prueba: muestra la sesión y tiene botones para iniciar y cerrar sesión.
function SesionDePrueba() {
  const { usuario, cargandoSesion, esAdmin, iniciarSesion, cerrarSesion } = useAuth();
  return (
    <div>
      <p>Usuario: {usuario ? usuario.nombre : "ninguno"}</p>
      <p>Comprobando: {cargandoSesion ? "sí" : "no"}</p>
      <p>Administrador: {esAdmin ? "sí" : "no"}</p>
      <button type="button" onClick={() => iniciarSesion("cliente@fuma.cl", "cliente123").catch(() => {})}>
        Entrar
      </button>
      <button type="button" onClick={cerrarSesion}>
        Salir
      </button>
    </div>
  );
}

function renderizarSesion() {
  return render(
    <AuthProvider>
      <SesionDePrueba />
    </AuthProvider>
  );
}

// Pruebas de la sesión: login contra el backend, token guardado y recuperación al recargar.
describe("AuthProvider (iniciar y cerrar sesión)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // Login: el usuario llega desde el backend y solo se guarda el token.
  it("inicia sesión, muestra el usuario y guarda solo el token", async () => {
    simularApi({ "POST /auth/login": ok({ token: "token-cliente", usuario: USUARIO_CLIENTE }) });
    renderizarSesion();

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Usuario: Cliente Demo")).toBeTruthy();
    expect(window.localStorage.getItem(CLAVE_TOKEN)).toBe("token-cliente");
    expect(window.localStorage.length).toBe(1); // no se guarda el usuario ni la contraseña
  });

  it("no inicia sesión ni guarda token cuando las credenciales son incorrectas", async () => {
    const espia = simularApi({ "POST /auth/login": fallo(401, "Correo o contraseña incorrectos.") });
    renderizarSesion();

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await esperarHasta(() => llamadasA(espia, "POST /auth/login").length === 1);

    expect(screen.getByText("Usuario: ninguno")).toBeTruthy();
    expect(window.localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it("indica que el usuario es administrador según el rol que entrega el backend", async () => {
    simularApi({ "POST /auth/login": ok({ token: "token-admin", usuario: USUARIO_ADMIN }) });
    renderizarSesion();

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Administrador: sí")).toBeTruthy();
  });

  it("cierra sesión y borra el token guardado", async () => {
    simularApi({ "POST /auth/login": ok({ token: "token-cliente", usuario: USUARIO_CLIENTE }) });
    renderizarSesion();

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await screen.findByText("Usuario: Cliente Demo");
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(screen.getByText("Usuario: ninguno")).toBeTruthy();
    expect(window.localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });
});

// Persistencia: al recargar la página, el token guardado se comprueba con el backend (GET /auth/me).
describe("AuthProvider (sesión al recargar la página)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("no consulta al backend cuando no hay token guardado", () => {
    const espia = simularApi({});
    renderizarSesion();

    expect(screen.getByText("Usuario: ninguno")).toBeTruthy();
    expect(screen.getByText("Comprobando: no")).toBeTruthy();
    expect(espia).not.toHaveBeenCalled();
  });

  it("restaura la sesión con el token guardado y lo envía al backend", async () => {
    window.localStorage.setItem(CLAVE_TOKEN, "token-guardado");
    const espia = simularApi({ "GET /auth/me": ok(USUARIO_CLIENTE) });

    renderizarSesion();

    expect(screen.getByText("Comprobando: sí")).toBeTruthy();
    expect(await screen.findByText("Usuario: Cliente Demo")).toBeTruthy();
    expect(screen.getByText("Comprobando: no")).toBeTruthy();
    expect(llamadasA(espia, "GET /auth/me")[0].cabeceras.Authorization).toBe("Bearer token-guardado");
  });

  it("borra el token y no inicia sesión cuando el backend responde 401", async () => {
    window.localStorage.setItem(CLAVE_TOKEN, "token-vencido");
    simularApi({ "GET /auth/me": fallo(401, "Sesión expirada.") });

    renderizarSesion();

    // Se espera a que termine la comprobación con el backend y recién ahí se revisa el resultado.
    expect(await screen.findByText("Comprobando: no")).toBeTruthy();
    expect(window.localStorage.getItem(CLAVE_TOKEN)).toBeNull();
    expect(screen.getByText("Usuario: ninguno")).toBeTruthy();
  });
});

// Token que vence: se renueva cada 20 minutos y, si el backend responde 401, se cierra la sesión.
describe("AuthProvider (renovación y vencimiento del token)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(CLAVE_TOKEN, "token-guardado");
  });

  it("cierra la sesión cuando alguna petición avisa que el token venció", async () => {
    simularApi({ "GET /auth/me": ok(USUARIO_CLIENTE) });
    renderizarSesion();
    await screen.findByText("Usuario: Cliente Demo");

    act(() => {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    });

    expect(screen.getByText("Usuario: ninguno")).toBeTruthy();
    expect(window.localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  // En vez de esperar 20 minutos de verdad, se captura la función del temporizador y se ejecuta a mano.
  it("renueva el token cuando pasan los minutos de renovación", async () => {
    let renovar = null;
    const setIntervalOriginal = window.setInterval.bind(window);
    spyOn(window, "setInterval").and.callFake((funcion, milisegundos, ...resto) => {
      if (milisegundos === MINUTOS_RENOVACION_TOKEN * 60 * 1000) {
        renovar = funcion;
        return 0;
      }
      return setIntervalOriginal(funcion, milisegundos, ...resto);
    });
    const espia = simularApi({
      "GET /auth/me": ok(USUARIO_CLIENTE),
      "POST /auth/refresh": ok({ token: "token-renovado", usuario: USUARIO_CLIENTE }),
    });

    renderizarSesion();
    await screen.findByText("Usuario: Cliente Demo");
    act(() => {
      renovar();
    });

    await esperarHasta(() => window.localStorage.getItem(CLAVE_TOKEN) === "token-renovado");
    expect(llamadasA(espia, "POST /auth/refresh").length).toBe(1);
  });
});
