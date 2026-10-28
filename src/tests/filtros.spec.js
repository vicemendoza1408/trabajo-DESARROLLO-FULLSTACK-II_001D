import { filtrarPorCategoria, filtrarPorTexto, obtenerOfertas } from "../utils/filtros.js";

// Pruebas de lógica pura de filtros de productos.
const productos = [
  { id: 1, nombre: "Polerón negro", idCategoria: "polerones", descuentoPorcentaje: 0 },
  { id: 2, nombre: "Polerón gris", idCategoria: "polerones", descuentoPorcentaje: 20 },
  { id: 3, nombre: "Polera blanca", idCategoria: "poleras", descuentoPorcentaje: 0 },
];

describe("filtros de productos", () => {
  it("filtra por texto sin distinguir mayúsculas", () => {
    const resultado = filtrarPorTexto(productos, "POLERÓN");
    expect(resultado.map((producto) => producto.id)).toEqual([1, 2]);
  });

  it("devuelve todos los productos cuando el texto está vacío", () => {
    expect(filtrarPorTexto(productos, "   ").length).toBe(3);
  });

  it("filtra por categoría y devuelve todos si no hay categoría", () => {
    expect(filtrarPorCategoria(productos, "poleras").map((producto) => producto.id)).toEqual([3]);
    expect(filtrarPorCategoria(productos, undefined).length).toBe(3);
  });

  it("obtiene solo los productos con descuento", () => {
    expect(obtenerOfertas(productos).map((producto) => producto.id)).toEqual([2]);
  });
});
