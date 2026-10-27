import { calcularPrecioFinal, calcularTotales, formatearPrecio } from "../utils/precios.js";
import { COSTO_DESPACHO } from "../utils/constantes.js";

// Pruebas de lógica pura: cálculo de precios y totales.
describe("precios", () => {
  it("calcula el precio con descuento redondeado a pesos enteros", () => {
    // 24.990 con 20% de descuento = 19.992
    expect(calcularPrecioFinal(24990, 20)).toBe(19992);
  });

  it("devuelve el mismo precio cuando no hay descuento", () => {
    expect(calcularPrecioFinal(9990, 0)).toBe(9990);
  });

  it("suma el despacho solo cuando la entrega es a domicilio", () => {
    const despacho = calcularTotales(10000, "despacho");
    expect(despacho.costoEnvio).toBe(COSTO_DESPACHO);
    expect(despacho.total).toBe(10000 + COSTO_DESPACHO);
  });

  it("no cobra envío cuando el cliente retira en tienda", () => {
    const retiro = calcularTotales(10000, "retiro");
    expect(retiro.costoEnvio).toBe(0);
    expect(retiro.total).toBe(10000);
  });

  it("formatea montos en pesos chilenos", () => {
    expect(formatearPrecio(29990)).toContain("29.990");
  });
});
