import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  obtenerProductoPorId,
  obtenerProductos,
} from "../data/baseDeDatos.js";
import { CLAVE_PRODUCTOS } from "../utils/constantes.js";

// Pruebas del CRUD sobre localStorage. Cada prueba parte con el almacenamiento limpio.
describe("baseDeDatos (CRUD de productos)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("carga los datos semilla la primera vez", () => {
    expect(obtenerProductos().length).toBe(8);
  });

  it("crea un producto con id nuevo y lo persiste", () => {
    const cantidadInicial = obtenerProductos().length;
    const creado = crearProducto({ nombre: "Gorra", precio: 5990, descuentoPorcentaje: 0, idCategoria: "accesorios" });

    expect(creado.id).toBe(9);
    expect(obtenerProductos().length).toBe(cantidadInicial + 1);
    expect(obtenerProductoPorId(9).nombre).toBe("Gorra");
  });

  it("actualiza los campos indicados de un producto existente", () => {
    actualizarProducto(1, { precio: 19990 });
    expect(obtenerProductoPorId(1).precio).toBe(19990);
  });

  it("devuelve null al actualizar un producto que no existe", () => {
    expect(actualizarProducto(999, { precio: 1 })).toBeNull();
  });

  it("elimina un producto existente y reporta el resultado", () => {
    expect(eliminarProducto(2)).toBe(true);
    expect(obtenerProductoPorId(2)).toBeNull();
    expect(eliminarProducto(2)).toBe(false);
  });

  // Prueba con mock: se espía el método setItem para verificar que el cambio se guarda.
  it("guarda los cambios en localStorage al crear (mock de setItem)", () => {
    const espia = spyOn(window.localStorage, "setItem").and.callThrough();
    crearProducto({ nombre: "Cinturón", precio: 1000, descuentoPorcentaje: 0, idCategoria: "accesorios" });

    expect(espia).toHaveBeenCalled();
    const claveGuardada = espia.calls.mostRecent().args[0];
    expect(claveGuardada).toBe(CLAVE_PRODUCTOS);
  });
});
