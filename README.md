# Fuma · Tienda de ropa

Tienda online de ropa desarrollada con React para la Evaluación Parcial 2 de DSY1104 (Desarrollo Fullstack II). En la Evaluación Parcial 3 el frontend se conecta por `fetch` a un backend en Spring Boot con MySQL (repositorio `trabajo-DESARROLLO-FULLSTACK-II_001D-backend`). Todos los datos (productos, categorías, usuarios y boletas) vienen del backend.

## Repositorios del proyecto
| Repositorio | Contenido | Enlace |
|---|---|---|
| `trabajo-DESARROLLO-FULLSTACK-II_001D` (este) | Frontend: React + Vite | https://github.com/vicemendoza1408/trabajo-DESARROLLO-FULLSTACK-II_001D |
| `trabajo-DESARROLLO-FULLSTACK-II_001D-backend` | Backend: Spring Boot + MySQL + Swagger | https://github.com/vicemendoza1408/trabajo-DESARROLLO-FULLSTACK-II_001D-backend |

Para probar el sistema completo hay que levantar primero el backend (puerto 8080) y después este frontend (puerto 5173). La documentación de la API (Swagger) queda en http://localhost:8080/swagger-ui.html cuando el backend está corriendo.

## Funcionalidades
- Catálogo con búsqueda por nombre, categorías, ofertas y detalle de producto.
- Carrito de compras (agregar, cambiar cantidad, eliminar, vaciar) que se conserva al recargar.
- Inicio de sesión con JWT para tres roles (cliente, vendedor y administrador) y sesión que se conserva al recargar.
- Checkout con validación, retiro en tienda o despacho, pago simulado en el backend y página de compra exitosa o fallida.
- Panel de administración protegido: crear, editar y eliminar productos (CRUD) con la API.
- Vista del vendedor: productos y boletas en modo consulta (lista y detalle).
- Restricciones por rol: cada rol ve solo su menú y sus páginas; el backend rechaza lo demás (401 y 403).
- Diseño responsivo con Bootstrap (móvil, tablet y escritorio).

## Tecnologías
- React 18 + Vite 5
- React Router 6 (navegación)
- Bootstrap 5 (diseño responsivo)
- Jasmine + Karma + Testing Library (pruebas unitarias)
- Istanbul (cobertura)
- `fetch` para consumir la API REST del backend (JWT en `localStorage`)

## Requisitos
- Node.js 18 o superior
- El backend corriendo en `http://localhost:8080` (ver su README). La dirección se configura en el archivo `.env` (`VITE_API_URL`)
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
Los usuarios viven en la base de datos del backend (con la contraseña cifrada); el frontend ya no guarda ninguna contraseña.

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | `cliente@fuma.cl` | `cliente123` |
| Vendedor | `vendedor@fuma.cl` | `vendedor123` |
| Administrador | `admin@fuma.cl` | `admin123` |

El pago es simulado: una tarjeta de 16 dígitos que empieza con `0000` es rechazada; cualquier otra tarjeta válida (por ejemplo `4111 1111 1111 1111`) es aprobada.

El carrito y el token de la sesión se guardan en `localStorage`; para empezar de cero, ejecuta `localStorage.clear()` en la consola del navegador y recarga la página.

## Conexión con el backend y sesión
- `src/services/api.js`: único lugar con `fetch`. Agrega el token (`Authorization: Bearer ...`) y convierte los errores del backend en un `ErrorApi` con su código y mensaje.
- `src/hooks/useCargar.js` y `src/components/EstadoCarga.jsx`: cargan datos de la API y muestran "Cargando..." o el error.
- `src/context/AuthContext.jsx`: inicia sesión con `POST /auth/login` y guarda **solo el token** en `localStorage`. Al recargar la página valida el token con `GET /auth/me`, y mientras la sesión está activa lo renueva cada 20 minutos con `POST /auth/refresh`. Si el backend responde 401, la sesión se cierra.

## Rutas y permisos
| Ruta | Página | Quién puede entrar |
|---|---|---|
| `/` | Inicio | Todos |
| `/productos` y `/productos/:id` | Catálogo y detalle | Todos |
| `/categorias` y `/categorias/:idCategoria` | Productos por categoría | Todos |
| `/ofertas` | Productos con descuento | Todos |
| `/carrito` | Carrito | Todos |
| `/login` | Inicio de sesión | Todos |
| `/checkout` y `/compra-exitosa/:idPedido` | Finalizar compra y confirmación | Cliente y administrador (con sesión) |
| `/compra-fallida` | Pago rechazado | Todos |
| `/admin`, `/admin/productos/nuevo` y `/admin/productos/:id/editar` | Administración de productos | Administrador |
| `/boletas` y `/boletas/:id` | Lista y detalle de boletas | Vendedor y administrador |
| `/vendedor/productos` y `/vendedor/productos/:id` | Productos en modo consulta | Vendedor y administrador |

Las rutas protegidas usan `RutaProtegida`: sin sesión llevan al login; con otro rol muestran "Sin permiso". El menú de la barra también cambia según el rol
(el vendedor solo ve *Productos* y *Boletas*). Esto es comodidad para el usuario: la seguridad real la aplica el backend con los códigos 401 y 403.

## Estructura
```
src/
├── main.jsx        arranque de la app (estilos, router y contextos)
├── App.jsx         tabla de rutas
├── components/     piezas reutilizables
├── pages/          una página por ruta
├── context/        estado global (carrito, sesión)
├── services/       api.js: todas las llamadas al backend (fetch)
├── hooks/          useCargar: carga datos de la API con estados de carga y error
├── utils/          lógica pura (precios, carrito, validaciones, filtros, roles, fechas)
├── styles/         variables y estilos globales
└── tests/          pruebas (*.spec.js y *.spec.jsx)
```

## Pruebas
Hay 162 pruebas unitarias en 21 archivos. Karma carga todos los archivos `*.spec.js` y `*.spec.jsx` de `src/tests/`; para agregar una prueba basta con crear un archivo con ese nombre.

Las pruebas **no necesitan el backend encendido**: `src/tests/ayudas.js` reemplaza `fetch` por una versión falsa (`simularApi`) que responde lo que cada prueba indica. Así se prueban las páginas, `services/api.js` y la sesión completos, incluyendo los errores 400, 401, 402, 403 y 404 y el caso de backend apagado.

| Archivo | Qué prueba |
|---|---|
| `api.spec.js` | La capa `fetch`: rutas, token Bearer, 204, `ErrorApi`, error de red y evento de sesión vencida |
| `authContext.spec.jsx` | Login, token en localStorage, sesión al recargar (`/auth/me`), vencimiento y renovación |
| `rutaProtegida.spec.jsx` | Protección por rol: sin sesión, rol permitido, rol no permitido, recarga con token |
| `rutas.spec.jsx` | La app completa por rol (cliente, vendedor, administrador) |
| `login.spec.jsx`, `checkout.spec.jsx` | Formularios y flujos de login y compra (pago aprobado, 402, errores) |
| `paginasCatalogo.spec.jsx` | Productos, categorías, ofertas y detalle con datos de la API |
| `adminCrud.spec.jsx` | Panel del administrador: listar, crear, editar y eliminar (incluye producto con ventas) |
| `boletas.spec.jsx`, `vendedor.spec.jsx` | Boletas (lista, detalle, compra exitosa, 403) y vista del vendedor |
| `carga.spec.jsx` | `useCargar` y `EstadoCarga` |
| Resto | Lógica pura (precios, carrito, filtros, validaciones) y componentes de la tienda |

## Documentación
- `docs/ERS-V2.md` y `docs/ERS-V2.docx`: especificación de requisitos de software (versión 2).
- `docs/Informe-Frontend.md` y `docs/Informe-Frontend.docx`: informe técnico del frontend (React, props y estado, Bootstrap responsivo, cómo se conecta todo).
- `docs/Documento-Testing.md` y `docs/Documento-Testing.docx`: documento de testing y cobertura.
- `docs/cobertura.txt`: salida de `npm run test:coverage`.
- `docs/evidencia/salida-karma-mac.txt`: salida completa de `npm test` (ejecutada en macOS).
- `docs/evidencia/salida-karma-linux.txt`: salida completa de las pruebas con cobertura (ejecutada en Linux).
- `docs/capturas/`: capturas del diseño responsivo en tres anchos.
