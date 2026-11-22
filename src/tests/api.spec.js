import {
  ErrorApi,
  apiBoleta,
  apiCrearBoleta,
  apiCrearProducto,
  apiEliminarProducto,
  apiLogin,
  apiProductos,
  borrarToken,
  guardarToken,
  leerToken,
} from "../services/api.js";
import { CLAVE_TOKEN, EVENTO_SESION_EXPIRADA } from "../utils/constantes.js";
import { BOLETA, PRODUCTOS, fallo, llamadasA, ok, simularApi } from "./ayudas.js";

// Pruebas de services/api.js: es la única capa que habla con el backend con fetch.
describe("token guardado en el navegador", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("guarda, lee y borra el token en localStorage", () => {
    expect(leerToken()).toBeNull();

    guardarToken("token-de-prueba");
    expect(leerToken()).toBe("token-de-prueba");
    expect(window.localStorage.getItem(CLAVE_TOKEN)).toBe("token-de-prueba");

    borrarToken();
    expect(leerToken()).toBeNull();
  });
});

describe("api.js (peticiones al backend)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  // Rutas y parámetros: cada filtro se convierte en la dirección correcta.
  it("pide la lista de productos sin filtros", async () => {
    const espia = simularApi({ "GET /productos": ok(PRODUCTOS) });

    const productos = await apiProductos();

    expect(productos.length).toBe(PRODUCTOS.length);
    expect(llamadasA(espia, "GET /productos").length).toBe(1);
  });

  it("agrega el filtro de categoría y el de ofertas a la dirección", async () => {
    const espia = simularApi({
      "GET /productos?idCategoria=accesorios": ok([]),
      "GET /productos?ofertas=true": ok([]),
    });

    await apiProductos({ idCategoria: "accesorios" });
    await apiProductos({ ofertas: true });

    expect(llamadasA(espia, "GET /productos?idCategoria=accesorios").length).toBe(1);
    expect(llamadasA(espia, "GET /productos?ofertas=true").length).toBe(1);
  });

  // Token: solo se envía cuando hay uno guardado.
  it("no envía el encabezado Authorization cuando no hay token", async () => {
    const espia = simularApi({ "GET /productos": ok([]) });

    await apiProductos();

    expect(llamadasA(espia, "GET /productos")[0].cabeceras.Authorization).toBeUndefined();
  });

  it("envía el token como Bearer cuando hay una sesión guardada", async () => {
    guardarToken("mi-token");
    const espia = simularApi({ "GET /boletas/5": ok(BOLETA) });

    await apiBoleta(5);

    expect(llamadasA(espia, "GET /boletas/5")[0].cabeceras.Authorization).toBe("Bearer mi-token");
  });

  // Cuerpo JSON: los datos se envían con el método correcto.
  it("envía los datos de la compra como JSON con el método POST", async () => {
    const espia = simularApi({ "POST /boletas": ok(BOLETA, 201) });
    const datos = { nombre: "Cliente Demo", items: [{ idProducto: 2, cantidad: 2 }] };

    const boleta = await apiCrearBoleta(datos);

    expect(boleta.id).toBe(5);
    expect(llamadasA(espia, "POST /boletas")[0].cuerpo).toEqual(datos);
  });

  // 204: la operación sale bien y no hay nada que leer.
  it("devuelve null cuando el backend responde 204 (sin contenido)", async () => {
    simularApi({ "DELETE /productos/3": ok(undefined, 204) });

    const resultado = await apiEliminarProducto(3);

    expect(resultado).toBeNull();
  });
});

describe("api.js (errores)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lanza un ErrorApi con el estado, el mensaje y los errores por campo", async () => {
    simularApi({ "POST /productos": fallo(400, "Datos inválidos.", { precio: "El precio debe ser mayor que 0." }) });

    let error = null;
    try {
      await apiCrearProducto({ nombre: "Gorra" });
    } catch (capturado) {
      error = capturado;
    }

    expect(error instanceof ErrorApi).toBe(true);
    expect(error.estado).toBe(400);
    expect(error.message).toBe("Datos inválidos.");
    expect(error.errores.precio).toBe("El precio debe ser mayor que 0.");
  });

  it("lanza un ErrorApi con estado 0 cuando no hay conexión con el servidor", async () => {
    spyOn(window, "fetch").and.callFake(() => Promise.reject(new TypeError("Failed to fetch")));

    let error = null;
    try {
      await apiProductos();
    } catch (capturado) {
      error = capturado;
    }

    expect(error.estado).toBe(0);
    expect(error.message).toContain("No se pudo conectar con el servidor");
  });

  // 401 con token guardado = el token venció: la app debe enterarse para cerrar la sesión.
  it("avisa con un evento cuando una petición recibe 401 teniendo un token", async () => {
    guardarToken("token-vencido");
    simularApi({ "GET /boletas/5": fallo(401, "Sesión expirada.") });
    const espiaEvento = jasmine.createSpy("sesionExpirada");
    window.addEventListener(EVENTO_SESION_EXPIRADA, espiaEvento);

    let error = null;
    try {
      await apiBoleta(5);
    } catch (capturado) {
      error = capturado;
    }
    window.removeEventListener(EVENTO_SESION_EXPIRADA, espiaEvento);

    expect(error.estado).toBe(401);
    expect(espiaEvento).toHaveBeenCalledTimes(1);
  });

  // En el login un 401 solo significa "contraseña incorrecta": no es una sesión vencida.
  it("no avisa sesión expirada cuando el 401 viene del login", async () => {
    guardarToken("token-viejo");
    simularApi({ "POST /auth/login": fallo(401, "Correo o contraseña incorrectos.") });
    const espiaEvento = jasmine.createSpy("sesionExpirada");
    window.addEventListener(EVENTO_SESION_EXPIRADA, espiaEvento);

    let error = null;
    try {
      await apiLogin("cliente@fuma.cl", "mala");
    } catch (capturado) {
      error = capturado;
    }
    window.removeEventListener(EVENTO_SESION_EXPIRADA, espiaEvento);

    expect(error.message).toBe("Correo o contraseña incorrectos.");
    expect(espiaEvento).not.toHaveBeenCalled();
  });
});
