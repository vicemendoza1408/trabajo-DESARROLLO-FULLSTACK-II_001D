// Se muestra cuando la URL no coincide con ninguna ruta (la ruta "*" de App.jsx).
export default function PaginaNoEncontrada() {
  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold">Página no encontrada</h1>
      <p className="text-muted">La dirección que buscas no existe.</p>
    </div>
  );
}
