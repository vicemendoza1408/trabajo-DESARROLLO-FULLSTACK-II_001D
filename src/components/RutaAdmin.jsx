import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Protege una página: si el usuario no es administrador, lo envía al inicio de sesión.
// Props:
//   children: la página que solo puede ver el administrador.
export default function RutaAdmin({ children }) {
  const { esAdmin } = useAuth();

  if (!esAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
