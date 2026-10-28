import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FormularioCheckout from "../components/FormularioCheckout.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import { obtenerPedidos } from "../data/baseDeDatos.js";
import PaginaCheckout from "../pages/PaginaCheckout.jsx";
import PaginaCompraExitosa from "../pages/PaginaCompraExitosa.jsx";
import PaginaCompraFallida from "../pages/PaginaCompraFallida.jsx";
import { CLAVE_CARRITO, CLAVE_SESION } from "../utils/constantes.js";

// Un producto en el carrito para las pruebas del checkout.
const CARRITO_DE_PRUEBA = [
  { idProducto: 3, nombre: "Polera blanca", imagen: "/img/placeholder.svg", precioUnitario: 9990, cantidad: 1 },
];

// Llena el formulario con datos válidos. La tarjeta es la que se quiere probar.
function llenarFormulario(numeroTarjeta) {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Vicente" } });
  fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "vice@fuma.cl" } });
  fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "912345678" } });
  fireEvent.change(screen.getByLabelText("Número de tarjeta"), { target: { value: numeroTarjeta } });
}

// Pruebas del formulario de checkout: validación, estado y condicionales.
describe("FormularioCheckout", () => {
  // Validación + evento submit: formulario vacío muestra errores y no confirma.
  it("muestra errores y no confirma cuando el formulario está vacío", () => {
    const espiaConfirmar = jasmine.createSpy("onConfirmar");
    render(
      <FormularioCheckout opcionEntrega="retiro" onCambiarEntrega={() => {}} onConfirmar={espiaConfirmar} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(espiaConfirmar).not.toHaveBeenCalled();
    expect(screen.getByText("Ingresa tu nombre.")).toBeTruthy();
  });

  // Renderizado condicional: la dirección aparece solo con despacho.
  it("muestra el campo de dirección solo cuando la entrega es despacho", () => {
    const { rerender } = render(
      <FormularioCheckout opcionEntrega="retiro" onCambiarEntrega={() => {}} onConfirmar={() => {}} />
    );
    expect(screen.queryByLabelText("Dirección de despacho")).toBeNull();

    rerender(<FormularioCheckout opcionEntrega="despacho" onCambiarEntrega={() => {}} onConfirmar={() => {}} />);
    expect(screen.getByLabelText("Dirección de despacho")).toBeTruthy();
  });

  // State: lo que el usuario escribe se refleja en el campo.
  it("actualiza el campo nombre al escribir", () => {
    render(<FormularioCheckout opcionEntrega="retiro" onCambiarEntrega={() => {}} onConfirmar={() => {}} />);
    const campo = screen.getByLabelText("Nombre");
    fireEvent.change(campo, { target: { value: "Vicente" } });
    expect(campo.value).toBe("Vicente");
  });

  // Evento + props: con datos válidos se llama a onConfirmar con los datos.
  it("confirma con los datos cuando todo es válido", () => {
    const espiaConfirmar = jasmine.createSpy("onConfirmar");
    render(<FormularioCheckout opcionEntrega="retiro" onCambiarEntrega={() => {}} onConfirmar={espiaConfirmar} />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Vicente" } });
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "vice@fuma.cl" } });
    fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "912345678" } });
    fireEvent.change(screen.getByLabelText("Número de tarjeta"), { target: { value: "4111111111111111" } });
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(espiaConfirmar).toHaveBeenCalledTimes(1);
    expect(espiaConfirmar.calls.mostRecent().args[0].nombre).toBe("Vicente");
  });
});

// Pruebas de la página completa: autocompletado, pago rechazado y pago aprobado.
describe("PaginaCheckout (flujo de compra)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(CARRITO_DE_PRUEBA));
  });

  function renderizarFlujo() {
    return render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <AuthProvider>
          <CarritoProvider>
            <Routes>
              <Route path="/checkout" element={<PaginaCheckout />} />
              <Route path="/compra-fallida" element={<PaginaCompraFallida />} />
              <Route path="/compra-exitosa/:idPedido" element={<PaginaCompraExitosa />} />
            </Routes>
          </CarritoProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  // Autocompletado: con sesión iniciada, el nombre llega desde el usuario conectado.
  it("autocompleta el nombre con el usuario que tiene la sesión iniciada", () => {
    window.localStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({ id: 1, nombre: "Cliente Demo", correo: "cliente@fuma.cl", telefono: "912345678", direccion: "Av. Principal 123", rol: "cliente" })
    );
    renderizarFlujo();

    expect(screen.getByLabelText("Nombre").value).toBe("Cliente Demo");
  });

  // Pago rechazado: una tarjeta que empieza con 0000 lleva a la página de compra fallida.
  it("lleva a compra fallida cuando el pago es rechazado", () => {
    renderizarFlujo();
    llenarFormulario("0000 1111 2222 3333");
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(screen.getByRole("heading", { name: "No se pudo completar el pago" })).toBeTruthy();
  });

  // Pago aprobado: se crea el pedido, se vacía el carrito y se muestra la compra exitosa.
  it("crea el pedido, vacía el carrito y muestra la compra exitosa", () => {
    renderizarFlujo();
    llenarFormulario("4111 1111 1111 1111");
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(screen.getByRole("heading", { name: "¡Compra exitosa!" })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(CLAVE_CARRITO))).toEqual([]);
    expect(obtenerPedidos().length).toBe(1);
  });
});
