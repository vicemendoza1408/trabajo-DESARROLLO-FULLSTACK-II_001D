# Fuma · Tienda de ropa

Tienda online de ropa desarrollada con React para la Evaluación Parcial 2 de DSY1104 (Desarrollo Fullstack II). Es una aplicación solo de frontend: los datos se simulan y se guardan en el navegador con `localStorage` (no hay backend).

## Funcionalidades
- Catálogo con búsqueda por nombre, categorías, ofertas y detalle de producto.
- Carrito de compras (agregar, cambiar cantidad, eliminar, vaciar) que se conserva al recargar.
- Inicio de sesión simulado para cliente y administrador.
- Checkout con validación, retiro en tienda o despacho, pago simulado y página de compra exitosa o fallida.
- Panel de administración protegido: crear, editar y eliminar productos (CRUD).
- Diseño responsivo con Bootstrap (móvil, tablet y escritorio).

## Tecnologías
- React 18 + Vite 5
- React Router 6 (navegación)
- Bootstrap 5 (diseño responsivo)
- Jasmine + Karma + Testing Library (pruebas unitarias)
- Istanbul (cobertura)
- Datos simulados con `localStorage`

## Requisitos
- Node.js 18 o superior
- Google Chrome (o Chromium) para las pruebas

## Instalación y ejecución
```bash
npm install
npm run dev            # servidor de desarrollo
npm run build          # compilación de producción
npm test               # pruebas unitarias (Karma, Chrome headless)
npm run test:coverage  # pruebas con informe de cobertura
```

Si Karma no encuentra Chrome, define la variable `CHROME_BIN` con la ruta del ejecutable.

## Datos de prueba
| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | `cliente@fuma.cl` | `cliente123` |
| Administrador | `admin@fuma.cl` | `admin123` |

El pago es simulado: una tarjeta de 16 dígitos que empieza con `0000` es rechazada; cualquier otra tarjeta válida (por ejemplo `4111 1111 1111 1111`) es aprobada.

Para volver a los datos iniciales, ejecuta `localStorage.clear()` en la consola del navegador y recarga la página.

## Rutas
| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/productos` y `/productos/:id` | Catálogo y detalle |
| `/categorias` y `/categorias/:idCategoria` | Productos por categoría |
| `/ofertas` | Productos con descuento |
| `/carrito` | Carrito |
| `/checkout` | Finalizar compra |
| `/compra-exitosa/:idPedido` y `/compra-fallida` | Resultado del pago |
| `/login` | Inicio de sesión |
| `/admin`, `/admin/productos/nuevo` y `/admin/productos/:id/editar` | Panel de administración (solo administrador) |

## Estructura
```
src/
├── main.jsx        arranque de la app (estilos, router y contextos)
├── App.jsx         tabla de rutas
├── components/     piezas reutilizables
├── pages/          una página por ruta
├── context/        estado global (carrito, sesión)
├── data/           datos iniciales y CRUD sobre localStorage
├── utils/          lógica pura (precios, carrito, validaciones, filtros, pago)
├── styles/         variables y estilos globales
└── tests/          pruebas (*.spec.js y *.spec.jsx)
```

## Pruebas
Hay 93 pruebas unitarias en 17 archivos. Karma carga todos los archivos `*.spec.js` y `*.spec.jsx` de `src/tests/`; para agregar una prueba basta con crear un archivo con ese nombre.

## Documentación
- `docs/ERS-V2.md` y `docs/ERS-V2.docx`: especificación de requisitos de software (versión 2).
- `docs/Documento-Testing.md` y `docs/Documento-Testing.docx`: documento de testing y cobertura.
- `docs/cobertura.txt`: salida de `npm run test:coverage`.
- `docs/evidencia/salida-karma-mac.txt`: salida completa de `npm test` (ejecutada en macOS).
- `docs/evidencia/salida-karma-linux.txt`: salida completa de las pruebas con cobertura (ejecutada en Linux).
- `docs/capturas/`: capturas del diseño responsivo en tres anchos.
