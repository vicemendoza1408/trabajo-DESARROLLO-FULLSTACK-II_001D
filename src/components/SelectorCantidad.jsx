// Botones − y + para cambiar la cantidad de un producto. No baja de 1: para quitar el producto se usa "Eliminar".
// Props:
//   cantidad: cantidad actual.
//   onCambiar: se llama con la nueva cantidad (cantidad + 1 o cantidad - 1).
export default function SelectorCantidad({ cantidad, onCambiar }) {
  return (
    <div className="input-group input-group-sm flex-nowrap" style={{ width: "120px" }}>
      <button
        type="button"
        className="btn btn-outline-secondary"
        aria-label="Disminuir cantidad"
        disabled={cantidad <= 1}
        onClick={() => onCambiar(cantidad - 1)}
      >
        −
      </button>
      <span className="form-control text-center" aria-live="polite">
        {cantidad}
      </span>
      <button
        type="button"
        className="btn btn-outline-secondary"
        aria-label="Aumentar cantidad"
        onClick={() => onCambiar(cantidad + 1)}
      >
        +
      </button>
    </div>
  );
}
