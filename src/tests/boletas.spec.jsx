import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalleBoleta from "../components/DetalleBoleta.jsx";
import PaginaBoletaDetalle from "../pages/PaginaBoletaDetalle.jsx";
import PaginaBoletas from "../pages/PaginaBoletas.jsx";
import PaginaCompraExitosa from "../pages/PaginaCompraExitosa.jsx";
import { formatearFecha } from "../utils/fechas.js";
import { BOLETA, fallo, llamadasA, ok, simularApi } from "./ayudas.js";

// Una segunda boleta, con despacho a domicilio.
const BOLETA_DESPACHO = {
  ...BOLETA,
  id: 6,
  cliente: { nombre: "Admin Compra", correo: "admin@fuma.cl", telefono: "934567890" },
  opcionEntrega: "despacho",
  direccion: "Calle Falsa 123",
  costoEnvio: 3990,
  total: 19974,
};

// Pruebas del contenido de una boleta (lo comparten el cliente, el vendedor y el administrador).
describe("DetalleBoleta", () => {
  it("muestra los productos comprados con su cantidad", () => {
    render(<DetalleBoleta boleta={BOLETA} />);

    expect(screen.getByText("Polera blanca × 2")).toBeTruthy();
  });

  it("indica retiro en tienda cuando no hay despacho", () => {
    render(<DetalleBoleta boleta={BOLETA} />);

    expect(screen.getByText(/Retiro en tienda/)).toBeTruthy();
  });

  it("indica la dirección cuando el pedido es con despacho", () => {
    render(<DetalleBoleta boleta={BOLETA_DESPACHO} />);

    expect(screen.getByText(/Despacho a Calle Falsa 123/)).toBeTruthy();
  });
});

// Lista de boletas (vendedor y administrador). Es una página de consulta: los datos vienen de GET /boletas.
describe("PaginaBoletas", () => {
  function renderizarLista() {
    return render(
      <MemoryRouter>
        <PaginaBoletas />
      </MemoryRouter>
    );
  }

  it("muestra una fila por boleta con el nombre del cliente y un enlace al detalle", async () => {
    simularApi({ "GET /boletas": ok([BOLETA_DESPACHO, BOLETA]) });
    renderizarLista();

    expect(await screen.findByText("Admin Compra")).toBeTruthy();
    expect(screen.getByText("Cliente Demo")).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBe(3); // encabezado + 2 boletas
    expect(screen.getAllByRole("link", { name: "Ver detalle" })[0].getAttribute("href")).toBe("/boletas/6");
  });

  it("muestra un mensaje cuando todavía no hay boletas", async () => {
    simularApi({ "GET /boletas": ok([]) });
    renderizarLista();

    expect(await screen.findByText("Todavía no hay boletas.")).toBeTruthy();
  });

  // Seguridad: si el rol no tiene permiso, el backend responde 403 y la página muestra su mensaje.
  it("muestra el mensaje del backend cuando no tiene permiso (403)", async () => {
    simularApi({ "GET /boletas": fallo(403, "No tienes permiso para realizar esta acción.") });
    renderizarLista();

    expect((await screen.findByRole("alert")).textContent).toBe("No tienes permiso para realizar esta acción.");
  });
});

describe("PaginaBoletaDetalle", () => {
  function renderizarDetalle(id) {
    return render(
      <MemoryRouter initialEntries={[`/boletas/${id}`]}>
        <Routes>
          <Route path="/boletas/:id" element={<PaginaBoletaDetalle />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("muestra los datos de la boleta, del cliente y de la compra", async () => {
    const espia = simularApi({ "GET /boletas/5": ok(BOLETA) });
    renderizarDetalle(5);

    expect(await screen.findByRole("heading", { name: "Boleta N.º 5" })).toBeTruthy();
    expect(screen.getByText(/cliente@fuma\.cl/)).toBeTruthy();
    expect(screen.getByText(formatearFecha(BOLETA.fecha), { exact: false })).toBeTruthy();
    expect(screen.getByText("Polera blanca × 2")).toBeTruthy();
    expect(llamadasA(espia, "GET /boletas/5").length).toBe(1);
  });

  it("muestra el error cuando la boleta no existe", async () => {
    simularApi({ "GET /boletas/999": fallo(404, "Boleta no encontrada.") });
    renderizarDetalle(999);

    expect((await screen.findByRole("alert")).textContent).toBe("Boleta no encontrada.");
  });
});

// Confirmación de compra del cliente: solo puede ver sus propias boletas (lo controla el backend).
describe("PaginaCompraExitosa", () => {
  function renderizarCompra(id) {
    return render(
      <MemoryRouter initialEntries={[`/compra-exitosa/${id}`]}>
        <Routes>
          <Route path="/compra-exitosa/:idPedido" element={<PaginaCompraExitosa />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("muestra la compra exitosa con el número de pedido", async () => {
    simularApi({ "GET /boletas/5": ok(BOLETA) });
    renderizarCompra(5);

    expect(await screen.findByRole("heading", { name: "¡Compra exitosa!" })).toBeTruthy();
    expect(screen.getByText(/Pedido N\.º 5/)).toBeTruthy();
  });

  it("muestra 'Pedido no encontrado' cuando el backend responde 404", async () => {
    simularApi({ "GET /boletas/999": fallo(404, "Boleta no encontrada.") });
    renderizarCompra(999);

    expect(await screen.findByRole("heading", { name: "Pedido no encontrado" })).toBeTruthy();
  });

  it("muestra el mensaje del backend cuando el cliente intenta ver la boleta de otro (403)", async () => {
    simularApi({ "GET /boletas/2": fallo(403, "No puedes ver las boletas de otros usuarios.") });
    renderizarCompra(2);

    expect((await screen.findByRole("alert")).textContent).toBe("No puedes ver las boletas de otros usuarios.");
  });
});
