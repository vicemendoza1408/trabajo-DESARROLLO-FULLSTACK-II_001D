// Muestra una fecha del backend (por ejemplo "2026-11-21T23:05:10") en formato chileno: "21-11-2026, 23:05".
export function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
}
