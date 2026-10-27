import { validarDatosCheckout } from "../utils/validaciones.js";
import { pagoEsAprobado } from "../utils/pago.js";

// Pruebas de validación del checkout y del pago simulado.
describe("validarDatosCheckout", () => {
  const datosCorrectos = {
    nombre: "Vicente",
    correo: "vice.mendoza@duocuc.cl",
    telefono: "912345678",
    direccion: "Av. Principal 123",
    opcionEntrega: "despacho",
  };

  it("no devuelve errores cuando los datos son válidos", () => {
    expect(validarDatosCheckout(datosCorrectos)).toEqual({});
  });

  it("marca todos los campos vacíos con un error", () => {
    const errores = validarDatosCheckout({ nombre: "", correo: "", telefono: "", opcionEntrega: "retiro" });
    expect(errores.nombre).toBeDefined();
    expect(errores.correo).toBeDefined();
    expect(errores.telefono).toBeDefined();
  });

  it("rechaza un correo sin formato válido", () => {
    const errores = validarDatosCheckout({ ...datosCorrectos, correo: "correo-sin-arroba" });
    expect(errores.correo).toBeDefined();
  });

  it("exige dirección solo cuando el despacho es a domicilio", () => {
    const conDespacho = validarDatosCheckout({ ...datosCorrectos, direccion: "" });
    const conRetiro = validarDatosCheckout({ ...datosCorrectos, direccion: "", opcionEntrega: "retiro" });
    expect(conDespacho.direccion).toBeDefined();
    expect(conRetiro.direccion).toBeUndefined();
  });
});

describe("pagoEsAprobado", () => {
  it("aprueba una tarjeta de 16 dígitos que no empieza con 0000", () => {
    expect(pagoEsAprobado("4111 1111 1111 1111")).toBe(true);
  });

  it("rechaza tarjetas que empiezan con 0000", () => {
    expect(pagoEsAprobado("0000111122223333")).toBe(false);
  });
});
