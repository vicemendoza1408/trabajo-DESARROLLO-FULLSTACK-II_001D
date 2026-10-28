import { useState } from "react";
import CampoFormulario from "./CampoFormulario.jsx";
import { validarProducto } from "../utils/validaciones.js";

// Imagen que se asigna a los productos nuevos (todavía no hay carga de imágenes).
const IMAGEN_POR_DEFECTO = "/img/placeholder.svg";

// Valores iniciales: vacíos para crear, o los datos del producto para editar.
function valoresIniciales(producto) {
  if (!producto) {
    return { nombre: "", descripcion: "", precio: "", descuentoPorcentaje: "0", idCategoria: "" };
  }
  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: String(producto.precio),
    descuentoPorcentaje: String(producto.descuentoPorcentaje),
    idCategoria: producto.idCategoria,
  };
}

// Formulario para crear o editar un producto. Valida antes de entregar los datos.
// Props:
//   productoInicial: producto a editar, o null para crear uno nuevo.
//   categorias: lista de categorías disponibles.
//   onGuardar: se llama con el producto ya normalizado (números como número).
export default function FormularioProducto({ productoInicial = null, categorias, onGuardar }) {
  const [campos, setCampos] = useState(() => valoresIniciales(productoInicial));
  const [errores, setErrores] = useState({});

  function actualizarCampo(campo, valor) {
    setCampos((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    const erroresEncontrados = validarProducto(campos, categorias);
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }

    onGuardar({
      nombre: campos.nombre.trim(),
      descripcion: campos.descripcion.trim(),
      precio: Number(campos.precio),
      descuentoPorcentaje: Number(campos.descuentoPorcentaje || 0),
      idCategoria: campos.idCategoria,
      imagen: productoInicial ? productoInicial.imagen : IMAGEN_POR_DEFECTO,
    });
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <CampoFormulario etiqueta="Nombre" nombre="nombre" valor={campos.nombre} error={errores.nombre}
        onCambiar={(valor) => actualizarCampo("nombre", valor)} />
      <CampoFormulario etiqueta="Descripción" nombre="descripcion" valor={campos.descripcion}
        onCambiar={(valor) => actualizarCampo("descripcion", valor)} />
      <CampoFormulario etiqueta="Precio (CLP)" nombre="precio" tipo="number" valor={campos.precio}
        error={errores.precio} onCambiar={(valor) => actualizarCampo("precio", valor)} />
      <CampoFormulario etiqueta="Descuento (%)" nombre="descuentoPorcentaje" tipo="number"
        valor={campos.descuentoPorcentaje} error={errores.descuentoPorcentaje}
        onCambiar={(valor) => actualizarCampo("descuentoPorcentaje", valor)} />

      <div className="mb-3">
        <label htmlFor="idCategoria" className="form-label">Categoría</label>
        <select id="idCategoria" className={errores.idCategoria ? "form-select is-invalid" : "form-select"}
          value={campos.idCategoria} onChange={(evento) => actualizarCampo("idCategoria", evento.target.value)}>
          <option value="">Selecciona una categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
          ))}
        </select>
        {errores.idCategoria && <div className="invalid-feedback d-block">{errores.idCategoria}</div>}
      </div>

      <button type="submit" className="btn btn-dark">Guardar producto</button>
    </form>
  );
}
