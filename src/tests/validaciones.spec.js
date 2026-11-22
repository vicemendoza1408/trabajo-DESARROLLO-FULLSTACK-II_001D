import { validarDatosCheckout } from "../utils/validaciones.js";

// Pruebas de validación del formulario de checkout.
// (La aprobación del pago ya no se prueba aquí: la decide el backend y la cubren BoletaServiceTest y checkout.spec.)
describe("validarDatosCheckout", () => {
  const datosCorrectos = {
    nombre: "Vicente",
    correo: "vice.mendoza@duocuc.cl",
    telefono: "912345678",
    direccion: "Av. Principal 123",
    numeroTarjeta: "4111 1111 1111 1111",
    opcionEntrega: "despacho",
  };

  it("no devuelve errores cuando los datos son válidos", () => {
    expect(validarDatosCheckout(datosCorrectos)).toEqual({});
  });

  it("rechaza un número de tarjeta que no tiene 16 dígitos", () => {
    const errores = validarDatosCheckout({ ...datosCorrectos, numeroTarjeta: "1234" });
    expect(errores.numeroTarjeta).toBeDefined();
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
