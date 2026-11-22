import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Protege una página: si el usuario no es administrador, lo envía al inicio de sesión.
// Al recargar la página, primero se espera a que el backend confirme la sesión; si no, un administrador
// sería enviado al login por error mientras todavía se está comprobando su token.
// Props:
//   children: la página que solo puede ver el administrador.
export default function RutaAdmin({ children }) {
  const { esAdmin, cargandoSesion } = useAuth();

  if (cargandoSesion) {
    return <p className="container py-5 text-muted">Comprobando sesión...</p>;
  }
  if (!esAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
