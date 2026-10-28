// Campo de formulario reutilizable: etiqueta, input y mensaje de error de Bootstrap.
// Props:
//   etiqueta: texto de la etiqueta.
//   nombre: nombre e id del campo (la etiqueta apunta a él).
//   tipo: "text", "email", "password", etc.
//   valor: valor actual.
//   error: mensaje de error, o vacío si el campo es válido.
//   onCambiar: se llama con el nuevo texto cada vez que el usuario escribe.
export default function CampoFormulario({ etiqueta, nombre, tipo = "text", valor, error = "", onCambiar }) {
  const claseInput = error ? "form-control is-invalid" : "form-control";

  return (
    <div className="mb-3">
      <label htmlFor={nombre} className="form-label">
        {etiqueta}
      </label>
      <input
        id={nombre}
        name={nombre}
        type={tipo}
        className={claseInput}
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
