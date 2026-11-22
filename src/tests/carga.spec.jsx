import { render, screen } from "@testing-library/react";
import EstadoCarga from "../components/EstadoCarga.jsx";
import { useCargar } from "../hooks/useCargar.js";
import { ErrorApi } from "../services/api.js";

// Componente de prueba: muestra en pantalla lo que entrega el hook useCargar.
function CargaDePrueba({ dependencia, falla = false }) {
  const { datos, cargando, error } = useCargar(
    () => (falla ? Promise.reject(new ErrorApi(500, "Falló la carga.")) : Promise.resolve(`valor ${dependencia}`)),
    [dependencia]
  );
  if (cargando) {
    return <p>Cargando datos</p>;
  }
  if (error) {
    return <p>Error: {error.message}</p>;
  }
  return <p>Datos: {datos}</p>;
}

// Pruebas del hook que carga datos de la API: estado de carga, resultado, error y recarga.
describe("useCargar", () => {
  it("muestra el estado de carga y luego los datos", async () => {
    render(<CargaDePrueba dependencia={1} />);

    expect(screen.getByText("Cargando datos")).toBeTruthy();
    expect(await screen.findByText("Datos: valor 1")).toBeTruthy();
  });

  it("entrega el error cuando la carga falla", async () => {
    render(<CargaDePrueba dependencia={1} falla />);

    expect(await screen.findByText("Error: Falló la carga.")).toBeTruthy();
  });

  it("vuelve a cargar cuando cambia una dependencia", async () => {
    const { rerender } = render(<CargaDePrueba dependencia={1} />);
    expect(await screen.findByText("Datos: valor 1")).toBeTruthy();

    rerender(<CargaDePrueba dependencia={2} />);

    expect(await screen.findByText("Datos: valor 2")).toBeTruthy();
  });
});

// Pruebas del componente que decide qué mostrar según el estado de la petición.
describe("EstadoCarga", () => {
  it("muestra 'Cargando...' mientras se espera la respuesta", () => {
    render(<EstadoCarga cargando error={null}><p>Contenido</p></EstadoCarga>);

    expect(screen.getByText("Cargando...")).toBeTruthy();
    expect(screen.queryByText("Contenido")).toBeNull();
  });

  it("muestra el mensaje del error cuando la petición falló", () => {
    render(<EstadoCarga cargando={false} error={new ErrorApi(500, "Error del servidor.")}><p>Contenido</p></EstadoCarga>);

    expect(screen.getByRole("alert").textContent).toBe("Error del servidor.");
    expect(screen.queryByText("Contenido")).toBeNull();
  });

  it("muestra el contenido cuando los datos ya llegaron", () => {
    render(<EstadoCarga cargando={false} error={null}><p>Contenido</p></EstadoCarga>);

    expect(screen.getByText("Contenido")).toBeTruthy();
  });
});
