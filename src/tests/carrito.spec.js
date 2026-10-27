import { agregarItem, cambiarCantidad } from "../utils/carrito.js";

// Pruebas de lógica pura del carrito: agregar, repetir, cambiar cantidad y no mutar el original.
describe("carrito", () => {
  const polera = {
    id: 3,
    nombre: "Polera blanca básica",
    imagen: "/img/placeholder.svg",
    precio: 9990,
    descuentoPorcentaje: 0,
  };

  it("agrega un producto nuevo con cantidad 1 y precio final", () => {
    const items = agregarItem([], polera);
    expect(items.length).toBe(1);
    expect(items[0].cantidad).toBe(1);
    expect(items[0].precioUnitario).toBe(9990);
  });

  it("suma cantidad cuando el producto ya estaba en el carrito", () => {
    const conUno = agregarItem([], polera);
    const conDos = agregarItem(conUno, polera);
    expect(conDos.length).toBe(1);
    expect(conDos[0].cantidad).toBe(2);
  });

  it("no modifica el arreglo original al agregar", () => {
    const original = [];
    agregarItem(original, polera);
    expect(original.length).toBe(0);
  });

  it("elimina el ítem cuando la cantidad cambia a 0", () => {
    const items = agregarItem([], polera);
    const resultado = cambiarCantidad(items, polera.id, 0);
    expect(resultado.length).toBe(0);
  });
});
