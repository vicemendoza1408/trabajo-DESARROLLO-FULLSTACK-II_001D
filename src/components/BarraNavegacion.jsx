import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

// Barra de navegación responsiva de Fuma.
// En pantallas pequeñas se colapsa en un botón; el estado "menuAbierto" controla si se muestra.
// Props:
//   cantidadCarrito: número de ítems del carrito (se muestra como insignia).
export default function BarraNavegacion({ cantidadCarrito }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú en móvil al elegir una opción.
  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function alternarMenu() {
    setMenuAbierto((abierto) => !abierto);
  }

  const claseColapso = menuAbierto ? "navbar-collapse collapse show" : "navbar-collapse collapse";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fuma-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={cerrarMenu}>
          Fuma
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          onClick={alternarMenu}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={claseColapso}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/productos" onClick={cerrarMenu}>Productos</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/categorias" onClick={cerrarMenu}>Categorías</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/ofertas" onClick={cerrarMenu}>Ofertas</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/carrito" onClick={cerrarMenu}>
                Carrito <span className="badge bg-warning text-dark">{cantidadCarrito}</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login" onClick={cerrarMenu}>Ingresar</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
