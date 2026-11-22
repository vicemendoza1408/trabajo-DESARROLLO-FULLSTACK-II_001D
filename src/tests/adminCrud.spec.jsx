import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FormularioProducto from "../components/FormularioProducto.jsx";
import TablaProductosAdmin from "../components/TablaProductosAdmin.jsx";
import PaginaAdmin from "../pages/PaginaAdmin.jsx";
import PaginaAdminProductoFormulario from "../pages/PaginaAdminProductoFormulario.jsx";
import { CATEGORIAS, PRODUCTOS, fallo, llamadasA, ok, simularApi } from "./ayudas.js";

// Pruebas de la tabla del panel: renderizado, eventos, confirmación antes de eliminar y modo solo lectura.
describe("TablaProductosAdmin", () => {
  function renderizarTabla(propiedades) {
    return render(
      <MemoryRouter>
        <TablaProductosAdmin productos={PRODUCTOS} categorias={CATEGORIAS} {...propiedades} />
      </MemoryRouter>
    );
  }

  // Renderizado de lista: una fila por producto, más el encabezado.
  it("muestra una fila por producto más el encabezado", () => {
    renderizarTabla({ onEliminar: () => {} });

    expect(screen.getAllByRole("row").length).toBe(PRODUCTOS.length + 1);
  });

  // La tabla recibe las categorías para mostrar su nombre en vez del id.
  it("muestra el nombre de la categoría de cada producto", () => {
    renderizarTabla({ onEliminar: () => {} });

    expect(screen.getAllByText("Accesorios").length).toBe(2);
    expect(screen.getByText("Polerones")).toBeTruthy();
  });

  // Mock de confirm: si el usuario acepta, se llama a onEliminar con el id.
  it("elimina el producto solo cuando el usuario confirma", () => {
    spyOn(window, "confirm").and.returnValue(true);
    const espiaEliminar = jasmine.createSpy("onEliminar");
    renderizarTabla({ onEliminar: espiaEliminar });

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(espiaEliminar).toHaveBeenCalledWith(1);
  });

  // Mock de confirm: si el usuario cancela, no se elimina nada.
  it("no elimina el producto cuando el usuario cancela", () => {
    spyOn(window, "confirm").and.returnValue(false);
    const espiaEliminar = jasmine.createSpy("onEliminar");
    renderizarTabla({ onEliminar: espiaEliminar });

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(espiaEliminar).not.toHaveBeenCalled();
  });

  // Vista del vendedor: sin editar ni eliminar, solo un enlace al detalle.
  it("en modo solo lectura no muestra editar ni eliminar, solo el enlace al detalle", () => {
    renderizarTabla({ soloLectura: true });

    expect(screen.queryByRole("button", { name: "Eliminar" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Editar" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "Ver detalle" })[0].getAttribute("href")).toBe("/vendedor/productos/1");
  });
});

// Pruebas del formulario de producto: validación, edición, datos normalizados y errores del backend.
describe("FormularioProducto", () => {
  // Validación: con campos vacíos se muestran los errores y no se guarda.
  it("muestra errores y no guarda cuando los datos no son válidos", () => {
    const espiaGuardar = jasmine.createSpy("onGuardar");
    render(<FormularioProducto categorias={CATEGORIAS} onGuardar={espiaGuardar} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(espiaGuardar).not.toHaveBeenCalled();
    expect(screen.getByText("Ingresa el nombre del producto.")).toBeTruthy();
    expect(screen.getByText("El precio debe ser un número entero mayor que 0.")).toBeTruthy();
  });

  // Estado inicial al editar: los campos vienen cargados con el producto.
  it("carga los datos del producto al editarlo", () => {
    render(<FormularioProducto productoInicial={PRODUCTOS[0]} categorias={CATEGORIAS} onGuardar={() => {}} />);

    expect(screen.getByLabelText("Nombre").value).toBe("Polerón negro");
  });

  // Evento submit: con datos válidos entrega el precio como número.
  it("entrega el precio como número cuando los datos son válidos", () => {
    const espiaGuardar = jasmine.createSpy("onGuardar");
    render(<FormularioProducto categorias={CATEGORIAS} onGuardar={espiaGuardar} />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Gorra negra" } });
    fireEvent.change(screen.getByLabelText("Precio (CLP)"), { target: { value: "7990" } });
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: "accesorios" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(espiaGuardar).toHaveBeenCalledTimes(1);
    expect(espiaGuardar.calls.mostRecent().args[0].precio).toBe(7990);
  });

  // El backend vuelve a validar: sus errores por campo se muestran junto al campo.
  it("muestra los errores por campo que envía el backend", () => {
    render(
      <FormularioProducto
        productoInicial={PRODUCTOS[0]}
        categorias={CATEGORIAS}
        onGuardar={() => {}}
        erroresServidor={{ precio: "El precio debe ser mayor que 0." }}
      />
    );

    expect(screen.getByText("El precio debe ser mayor que 0.")).toBeTruthy();
  });
});

// Pruebas del panel de administración conectado a la API: listar, eliminar, crear y editar.
describe("PaginaAdmin (lista y eliminar)", () => {
  function renderizarPanel() {
    return render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<PaginaAdmin />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("muestra los productos que entrega la API", async () => {
    simularApi({ "GET /productos": ok(PRODUCTOS), "GET /categorias": ok(CATEGORIAS) });
    renderizarPanel();

    expect(await screen.findByText(`${PRODUCTOS.length} productos en el catálogo`)).toBeTruthy();
    expect(screen.getAllByRole("row").length).toBe(PRODUCTOS.length + 1);
  });

  // Eliminar confirmado: se envía DELETE y la lista se vuelve a pedir al backend sin ese producto.
  it("elimina el producto en el backend cuando el usuario confirma y actualiza la lista", async () => {
    spyOn(window, "confirm").and.returnValue(true);
    let productosActuales = [...PRODUCTOS];
    const espia = simularApi({
      "GET /productos": () => ok(productosActuales),
      "GET /categorias": ok(CATEGORIAS),
      "DELETE /productos/1": () => {
        productosActuales = productosActuales.filter((producto) => producto.id !== 1);
        return ok(undefined, 204);
      },
    });
    renderizarPanel();
    await screen.findByText(`${PRODUCTOS.length} productos en el catálogo`);

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(await screen.findByText(`${PRODUCTOS.length - 1} productos en el catálogo`)).toBeTruthy();
    expect(llamadasA(espia, "DELETE /productos/1").length).toBe(1);
  });

  // Regla de negocio del backend: un producto con ventas no se puede eliminar (400).
  it("muestra el mensaje del backend cuando el producto tiene ventas y no se puede eliminar", async () => {
    spyOn(window, "confirm").and.returnValue(true);
    simularApi({
      "GET /productos": ok(PRODUCTOS),
      "GET /categorias": ok(CATEGORIAS),
      "DELETE /productos/1": fallo(400, "No se puede eliminar el producto porque ya tiene ventas registradas."),
    });
    renderizarPanel();
    await screen.findByText(`${PRODUCTOS.length} productos en el catálogo`);

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect((await screen.findByRole("alert")).textContent).toBe(
      "No se puede eliminar el producto porque ya tiene ventas registradas."
    );
    expect(screen.getByText(`${PRODUCTOS.length} productos en el catálogo`)).toBeTruthy();
  });

  it("no envía DELETE cuando el usuario cancela la confirmación", async () => {
    spyOn(window, "confirm").and.returnValue(false);
    const espia = simularApi({ "GET /productos": ok(PRODUCTOS), "GET /categorias": ok(CATEGORIAS) });
    renderizarPanel();
    await screen.findByText(`${PRODUCTOS.length} productos en el catálogo`);

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(llamadasA(espia, "DELETE /productos/1").length).toBe(0);
  });
});

describe("PaginaAdminProductoFormulario (crear y editar)", () => {
  function renderizarFormulario(ruta) {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/admin" element={<h1>Panel de administración</h1>} />
          <Route path="/admin/productos/nuevo" element={<PaginaAdminProductoFormulario />} />
          <Route path="/admin/productos/:id/editar" element={<PaginaAdminProductoFormulario />} />
        </Routes>
      </MemoryRouter>
    );
  }

  async function llenarProductoNuevo() {
    fireEvent.change(await screen.findByLabelText("Nombre"), { target: { value: "Gorra negra" } });
    fireEvent.change(screen.getByLabelText("Precio (CLP)"), { target: { value: "7990" } });
    fireEvent.change(screen.getByLabelText("Categoría"), { target: { value: "accesorios" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));
  }

  // Crear: se envía POST /productos con los datos y se vuelve al panel.
  it("crea un producto con POST y vuelve al panel", async () => {
    const espia = simularApi({
      "GET /categorias": ok(CATEGORIAS),
      "POST /productos": ok({ ...PRODUCTOS[0], id: 9, nombre: "Gorra negra" }, 201),
    });
    renderizarFormulario("/admin/productos/nuevo");

    await llenarProductoNuevo();

    expect(await screen.findByRole("heading", { name: "Panel de administración" })).toBeTruthy();
    const enviado = llamadasA(espia, "POST /productos")[0].cuerpo;
    expect(enviado.nombre).toBe("Gorra negra");
    expect(enviado.precio).toBe(7990);
    expect(enviado.idCategoria).toBe("accesorios");
  });

  // Actualizar: se carga el producto, se cambia el precio y se envía PUT /productos/1.
  it("actualiza el precio de un producto existente con PUT", async () => {
    const espia = simularApi({
      "GET /categorias": ok(CATEGORIAS),
      "GET /productos/1": ok(PRODUCTOS[0]),
      "PUT /productos/1": ok({ ...PRODUCTOS[0], precio: 19990 }),
    });
    renderizarFormulario("/admin/productos/1/editar");

    fireEvent.change(await screen.findByLabelText("Precio (CLP)"), { target: { value: "19990" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar producto" }));

    expect(await screen.findByRole("heading", { name: "Panel de administración" })).toBeTruthy();
    expect(llamadasA(espia, "PUT /productos/1")[0].cuerpo.precio).toBe(19990);
  });

  // Error del backend: se muestra el aviso general y el error junto al campo; no se sale de la página.
  it("muestra los errores del backend y se queda en el formulario", async () => {
    simularApi({
      "GET /categorias": ok(CATEGORIAS),
      "POST /productos": fallo(400, "Datos inválidos.", { precio: "El precio debe ser mayor que 0." }),
    });
    renderizarFormulario("/admin/productos/nuevo");

    await llenarProductoNuevo();

    expect((await screen.findByRole("alert")).textContent).toBe("Datos inválidos.");
    expect(screen.getByText("El precio debe ser mayor que 0.")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Panel de administración" })).toBeNull();
  });

  it("muestra 'Producto no encontrado' al editar un producto que no existe", async () => {
    simularApi({
      "GET /categorias": ok(CATEGORIAS),
      "GET /productos/999": fallo(404, "Producto no encontrado."),
    });
    renderizarFormulario("/admin/productos/999/editar");

    expect(await screen.findByRole("heading", { name: "Producto no encontrado" })).toBeTruthy();
  });
});
