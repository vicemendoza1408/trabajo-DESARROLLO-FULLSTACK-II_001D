import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AlertaMensaje from "../components/AlertaMensaje.jsx";
import CampoFormulario from "../components/CampoFormulario.jsx";
import FormularioLogin from "../components/FormularioLogin.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import PaginaLogin from "../pages/PaginaLogin.jsx";

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

  function renderizarLogin() {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <PaginaLogin />
        </AuthProvider>
      </MemoryRouter>
    );
  }

  // Validación: con campos vacíos muestra un aviso y no inicia sesión.
  it("muestra un aviso cuando los campos están vacíos", () => {
    renderizarLogin();
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByRole("alert").textContent).toBe("Completa el correo y la contraseña.");
    expect(window.localStorage.getItem("fuma_sesion")).toBeNull();
  });

  // Validación: credenciales incorrectas muestran el error y no guardan sesión.
  it("muestra un error con credenciales incorrectas", () => {
    renderizarLogin();
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "cliente@fuma.cl" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "mala" } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByRole("alert").textContent).toBe("Correo o contraseña incorrectos.");
    expect(window.localStorage.getItem("fuma_sesion")).toBeNull();
  });
});
