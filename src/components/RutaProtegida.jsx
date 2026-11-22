import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PaginaSinPermiso from "../pages/PaginaSinPermiso.jsx";

// Protege una página según el rol del usuario.
//   - Sin sesión: lo envía a iniciar sesión (y después del login vuelve a esta página).
//   - Con sesión pero con otro rol: muestra "Sin permiso".
//   - Con un rol permitido: muestra la página.
// Al recargar, primero se espera a que el backend confirme la sesión; si no, un usuario con sesión
// sería enviado al login por error mientras todavía se comprueba su token.
// Props:
//   roles: lista de roles que pueden ver la página, por ejemplo [ROLES.ADMIN, ROLES.VENDEDOR].
//   children: la página protegida.
// Esto solo decide qué se muestra: la seguridad real la hace el backend (responde 401 y 403).
export default function RutaProtegida({ roles, children }) {
  const { usuario, cargandoSesion } = useAuth();
  const ubicacion = useLocation();

  if (cargandoSesion) {
    return <p className="container py-5 text-muted">Comprobando sesión...</p>;
  }
  if (usuario === null) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />;
  }
  if (!roles.includes(usuario.rol)) {
    return <PaginaSinPermiso />;
  }
  return children;
}
