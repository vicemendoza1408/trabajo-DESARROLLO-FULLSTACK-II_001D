// Campo de búsqueda controlado: su valor lo decide la página que lo usa.
// Props:
//   valor: texto actual del campo.
//   onCambiar: se llama con el nuevo texto cada vez que el usuario escribe.
export default function BarraBusqueda({ valor, onCambiar }) {
  return (
    <div className="mb-4">
      <label htmlFor="busqueda-productos" className="visually-hidden">
        Buscar productos
      </label>
      <input
        id="busqueda-productos"
        type="search"
        className="form-control"
        placeholder="Buscar productos..."
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
      />
    </div>
  );
}
