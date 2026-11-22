import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FormularioCheckout from "../components/FormularioCheckout.jsx";
import RutaProtegida from "../components/RutaProtegida.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CarritoProvider } from "../context/CarritoContext.jsx";
import PaginaCheckout from "../pages/PaginaCheckout.jsx";
import PaginaCompraFallida from "../pages/PaginaCompraFallida.jsx";
import { CLAVE_CARRITO, CLAVE_TOKEN, ROLES } from "../utils/constantes.js";
import { BOLETA, USUARIO_CLIENTE, fallo, llamadasA, ok, simularApi } from "./ayudas.js";

// Un producto en el carrito para las pruebas del checkout.
const CARRITO_DE_PRUEBA = [
  { idProducto: 2, nombre: "Polera blanca", imagen: "/img/placeholder.svg", precioUnitario: 7992, cantidad: 2 },
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

// Pruebas de la página completa: autocompletado, compra aprobada, pago rechazado y errores del backend.
// El pago ya no se decide en el frontend: lo decide el backend (POST /boletas) y aquí se simula su respuesta.
describe("PaginaCheckout (flujo de compra)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(CARRITO_DE_PRUEBA));
    window.localStorage.setItem(CLAVE_TOKEN, "token-cliente");
  });

  // Se simula la sesión del cliente (GET /auth/me) y la respuesta del backend a la compra.
  function renderizarFlujo(respuestaCompra) {
    const espia = simularApi({ "GET /auth/me": ok(USUARIO_CLIENTE), "POST /boletas": respuestaCompra });
    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <AuthProvider>
          <CarritoProvider>
            <Routes>
              <Route path="/checkout" element={<RutaProtegida roles={[ROLES.CLIENTE]}><PaginaCheckout /></RutaProtegida>} />
              <Route path="/compra-fallida" element={<PaginaCompraFallida />} />
              <Route path="/compra-exitosa/:idPedido" element={<h1>¡Compra exitosa!</h1>} />
            </Routes>
          </CarritoProvider>
        </AuthProvider>
      </MemoryRouter>
    );
    return espia;
  }

  // Autocompletado: el nombre llega desde el usuario que entregó el backend.
  it("autocompleta el nombre con el usuario que tiene la sesión iniciada", async () => {
    renderizarFlujo(ok(BOLETA, 201));

    const campoNombre = await screen.findByLabelText("Nombre");

    expect(campoNombre.value).toBe("Cliente Demo");
  });

  // Compra aprobada: el backend responde 201, el carrito se vacía y se va a la boleta.
  it("crea la boleta, vacía el carrito y muestra la compra exitosa", async () => {
    renderizarFlujo(ok(BOLETA, 201));
    await screen.findByLabelText("Nombre");

    llenarFormulario("4111 1111 1111 1111");
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(await screen.findByRole("heading", { name: "¡Compra exitosa!" })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(CLAVE_CARRITO))).toEqual([]);
  });

  // Seguridad: del carrito solo viajan el id y la cantidad; los precios los pone el backend.
  it("envía solo el id y la cantidad de cada producto, sin precios", async () => {
    const espia = renderizarFlujo(ok(BOLETA, 201));
    await screen.findByLabelText("Nombre");

    llenarFormulario("4111 1111 1111 1111");
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));
    await screen.findByRole("heading", { name: "¡Compra exitosa!" });

    const enviado = llamadasA(espia, "POST /boletas")[0];
    expect(enviado.cuerpo.items).toEqual([{ idProducto: 2, cantidad: 2 }]);
    expect(enviado.cabeceras.Authorization).toBe("Bearer token-cliente");
  });

  // Pago rechazado: el backend responde 402 y el carrito se conserva para reintentar.
  it("lleva a compra fallida cuando el backend rechaza el pago (402)", async () => {
    renderizarFlujo(fallo(402, "El pago fue rechazado."));
    await screen.findByLabelText("Nombre");

    llenarFormulario("0000 1111 2222 3333");
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(await screen.findByRole("heading", { name: "No se pudo completar el pago" })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(CLAVE_CARRITO)).length).toBe(1);
  });

  // Otros errores (por ejemplo, un producto que ya no existe) se muestran en la misma página.
  it("muestra el error del backend y mantiene el carrito cuando la compra falla", async () => {
    renderizarFlujo(fallo(404, "El producto 2 no existe."));
    await screen.findByLabelText("Nombre");

    llenarFormulario("4111 1111 1111 1111");
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect((await screen.findByRole("alert")).textContent).toBe("El producto 2 no existe.");
    expect(JSON.parse(window.localStorage.getItem(CLAVE_CARRITO)).length).toBe(1);
  });

  it("muestra que el carrito está vacío cuando no hay productos", async () => {
    window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify([]));
    renderizarFlujo(ok(BOLETA, 201));

    expect(await screen.findByRole("heading", { name: "Tu carrito está vacío" })).toBeTruthy();
  });
});
