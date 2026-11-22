import { useEffect, useState } from "react";

// Hook para cargar datos de la API al abrir una página.
// Recibe una función que devuelve una promesa (por ejemplo () => apiProductos()) y entrega
// { datos, cargando, error }: mientras espera la respuesta "cargando" es true.
// Se vuelve a ejecutar cuando cambia algún valor de "dependencias" (por ejemplo, el id de la URL).
export function useCargar(funcion, dependencias = []) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });

  useEffect(() => {
    // "activo" evita guardar una respuesta si la página ya cambió o se cerró mientras se esperaba.
    let activo = true;
    setEstado({ datos: null, cargando: true, error: null });

    funcion()
      .then((datos) => {
        if (activo) {
          setEstado({ datos, cargando: false, error: null });
        }
      })
      .catch((error) => {
        if (activo) {
          setEstado({ datos: null, cargando: false, error });
        }
      });

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  return estado;
}
