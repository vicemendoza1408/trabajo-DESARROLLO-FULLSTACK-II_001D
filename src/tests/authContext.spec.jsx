import { fireEvent, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext.jsx";
import { buscarUsuarioPorCredenciales } from "../data/baseDeDatos.js";
import { CLAVE_SESION } from "../utils/constantes.js";

// Componente de prueba: inicia y cierra sesión, y muestra el nombre conectado.
function SesionDePrueba() {
  const { usuario, iniciarSesion, cerrarSesion } = useAuth();
  return (
    <div>
      <p>Usuario: {usuario ? usuario.nombre : "ninguno"}</p>
      <button type="button" onClick={() => iniciarSesion("cliente@fuma.cl", "cliente123")}>
        Entrar
      </button>
      <button type="button" onClick={cerrarSesion}>
        Salir
      </button>
    </div>
  );
}

// Pruebas de la búsqueda de credenciales y del estado de sesión.
describe("buscarUsuarioPorCredenciales", () => {
  // Lógica pura: credenciales correctas devuelven el usuario sin contraseña.
  it("devuelve el usuario sin contraseña cuando las credenciales son correctas", () => {
    const usuario = buscarUsuarioPorCredenciales("admin@fuma.cl", "admin123");
    expect(usuario.rol).toBe("admin");
    expect(usuario.contrasena).toBeUndefined();
  });

  // Lógica pura: una contraseña incorrecta no entrega ningún usuario.
  it("devuelve null cuando la contraseña es incorrecta", () => {
    expect(buscarUsuarioPorCredenciales("admin@fuma.cl", "otra")).toBeNull();
  });
});

describe("AuthProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // State + evento: iniciar sesión muestra el usuario y guarda la sesión sin contraseña.
  it("inicia sesión, muestra el usuario y guarda la sesión sin contraseña", () => {
    render(
      <AuthProvider>
        <SesionDePrueba />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByText("Usuario: Cliente Demo")).toBeTruthy();
    const guardada = JSON.parse(window.localStorage.getItem(CLAVE_SESION));
    expect(guardada.correo).toBe("cliente@fuma.cl");
    expect(guardada.contrasena).toBeUndefined();
  });

  // State + evento: cerrar sesión borra el usuario y la sesión guardada.
  it("cierra sesión y borra la sesión guardada", () => {
    render(
      <AuthProvider>
        <SesionDePrueba />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));

    expect(screen.getByText("Usuario: ninguno")).toBeTruthy();
    expect(window.localStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  // Persistencia: la sesión guardada se restaura al cargar la aplicación.
  it("restaura la sesión guardada al iniciar", () => {
    window.localStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({ id: 1, nombre: "Cliente Demo", correo: "cliente@fuma.cl", rol: "cliente" })
    );
    render(
      <AuthProvider>
        <SesionDePrueba />
      </AuthProvider>
    );

    expect(screen.getByText("Usuario: Cliente Demo")).toBeTruthy();
  });
});
