// Pago simulado para el checkout. No se conecta a ningún banco.
// Regla de la simulación: las tarjetas que comienzan con "0000" son rechazadas; el resto se aprueba.

export function pagoEsAprobado(numeroTarjeta) {
  const numeroLimpio = (numeroTarjeta || "").replace(/\s/g, "");
  const tarjetaValida = /^\d{16}$/.test(numeroLimpio);
  return tarjetaValida && !numeroLimpio.startsWith("0000");
}
