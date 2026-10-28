---
title: "Especificación de Requisitos de Software (ERS) — Versión 2"
subtitle: "Tienda online Fuma · DSY1104 Desarrollo Fullstack II · Evaluación Parcial 2"
author: "Vicente Mendoza e Isai Sepulveda"
date: "29 de octubre de 2026"
lang: es
---

# 1. Introducción

## 1.1 Propósito

Este documento especifica los requisitos funcionales y no funcionales de **Fuma**, una tienda online de ropa desarrollada como aplicación frontend con React. Describe lo que el sistema hace, para qué tipo de usuario y bajo qué restricciones. Esta versión (V2) corresponde a la solución final de la Evaluación Parcial 2 y refleja la implementación real del proyecto.

## 1.2 Alcance

Fuma permite a un visitante explorar el catálogo, a un cliente comprar productos mediante un carrito y un checkout con pago simulado, y a un administrador gestionar el catálogo de productos desde un panel.

El sistema **no incluye** backend, base de datos en servidor, pasarela de pago real, registro de usuarios, gestión de pedidos por parte del administrador ni carga de imágenes. Los datos se simulan y se almacenan en el navegador.

## 1.3 Definiciones y siglas

| Término | Definición |
|------------|------------------------------------------------|
| ERS | Especificación de Requisitos de Software |
| RF | Requisito funcional |
| RNF | Requisito no funcional |
| CRUD | Crear, leer, actualizar y eliminar |
| SPA | Aplicación de una sola página (Single Page Application) |
| CLP | Peso chileno |
| localStorage | Almacenamiento persistente del navegador, asociado a un sitio |
| Mock | Objeto simulado que reemplaza una dependencia durante una prueba |

## 1.4 Referencias

- Instrucciones de la Evaluación 2 (Anexo 1), DSY1104.
- Informe técnico del frontend de Fuma (`docs/Informe-Frontend`).
- Documento de testing y cobertura de Fuma (`docs/Documento-Testing`) y salida de cobertura (`docs/cobertura.txt`).
- Capturas de diseño responsivo (`docs/capturas/`).
- Código fuente y pruebas del repositorio del proyecto.

# 2. Descripción general

## 2.1 Perspectiva del producto

Fuma es un sistema autocontenido que se ejecuta completamente en el navegador. Se compone de:

- **Interfaz de usuario:** componentes React y estilos de Bootstrap 5.3.
- **Navegación:** React Router, sin recargas de página.
- **Estado global:** dos proveedores de contexto, uno para el carrito y otro para la sesión.
- **Datos:** una base de datos simulada (`baseDeDatos.js`) que realiza operaciones CRUD sobre localStorage.

## 2.2 Tipos de usuario

| Usuario | Descripción | Acciones principales |
|------------|------------------------|------------------------|
| Visitante | Persona sin sesión iniciada | Explorar catálogo, ofertas y categorías; usar el carrito; comprar |
| Cliente | Usuario que inició sesión con rol "cliente" | Igual que el visitante, con datos de envío autocompletados |
| Administrador | Usuario que inició sesión con rol "admin" | Todo lo anterior, más gestión de productos en el panel |

## 2.3 Restricciones

- **R-01.** La aplicación no tiene backend: toda la lógica y los datos viven en el navegador.
- **R-02.** El pago es simulado. Las tarjetas que comienzan con `0000` son rechazadas; las demás válidas son aprobadas.
- **R-03.** Las contraseñas se almacenan en texto plano en la fuente de datos simulada. Esto es una simplificación académica que no debe usarse en producción.
- **R-04.** Los datos persisten solo en el navegador donde se usan; no se comparten entre dispositivos.
- **R-05.** La moneda es el peso chileno (CLP) y el monto se maneja como número entero.

## 2.4 Supuestos

- **S-01.** El usuario accede desde un navegador moderno con JavaScript y localStorage habilitados.
- **S-02.** El costo de despacho es fijo ($3.990 CLP) y no depende de la comuna ni del peso del pedido.
- **S-03.** Los 8 productos iniciales tienen una imagen propia guardada en `public/img/`. Los productos que se crean desde el panel usan una imagen genérica, porque el sistema no incluye carga de imágenes.

# 3. Requisitos funcionales

Los requisitos se agrupan por módulo. La columna **Vista** indica la ruta donde se cumple el requisito.

## 3.1 Catálogo y navegación

| ID | Requisito | Vista | Prioridad |
|-------|-------------------------------|---------------|-------|
| RF-01 | El sistema muestra el catálogo completo de productos con nombre, descripción, precio e imagen. | `/productos` | Alta |
| RF-02 | El sistema permite buscar productos por nombre, sin distinguir mayúsculas. | `/productos` | Alta |
| RF-03 | El sistema muestra los productos separados por categoría y permite elegir una categoría. | `/categorias`, `/categorias/:idCategoria` | Alta |
| RF-04 | El sistema muestra únicamente los productos que tienen descuento. | `/ofertas` | Alta |
| RF-05 | El sistema muestra el detalle de un producto a partir de su identificador en la URL. | `/productos/:id` | Alta |
| RF-06 | El sistema muestra el precio original tachado y el precio final cuando un producto tiene descuento. | Todas las vistas de producto | Media |
| RF-07 | El sistema muestra un aviso de página no encontrada para rutas inexistentes. | `*` | Baja |
| RF-08 | La barra de navegación permanece visible en todas las vistas y se colapsa en pantallas pequeñas. | Todas | Alta |

## 3.2 Carrito de compras

| ID | Requisito | Vista | Prioridad |
|-------|-------------------------------|---------------|-------|
| RF-09 | El usuario puede agregar un producto al carrito desde la tarjeta o el detalle. | Catálogo, categorías, ofertas, detalle | Alta |
| RF-10 | Si el producto ya está en el carrito, el sistema suma una unidad en lugar de duplicar la línea. | Todas | Alta |
| RF-11 | El usuario puede aumentar o disminuir la cantidad de un producto. La cantidad mínima es 1. | `/carrito` | Alta |
| RF-12 | El usuario puede eliminar un producto del carrito. | `/carrito` | Alta |
| RF-13 | El usuario puede vaciar el carrito completo. | `/carrito` | Media |
| RF-14 | El carrito muestra el subtotal de cada línea y el subtotal general. | `/carrito` | Alta |
| RF-15 | La insignia de la barra de navegación muestra el total de unidades del carrito. | Todas | Media |
| RF-16 | El carrito se conserva al recargar la página. | Todas | Alta |

## 3.3 Sesión de usuario

| ID | Requisito | Vista | Prioridad |
|-------|-------------------------------|---------------|-------|
| RF-17 | El usuario puede iniciar sesión con correo y contraseña. | `/login` | Alta |
| RF-18 | El sistema rechaza el inicio de sesión si los campos están vacíos o las credenciales no coinciden, y lo indica al usuario. | `/login` | Alta |
| RF-19 | Tras iniciar sesión, el administrador es llevado al panel y el cliente a la tienda. | `/login` | Media |
| RF-20 | El sistema muestra el nombre del usuario conectado y permite cerrar sesión. | Barra de navegación | Media |
| RF-21 | La sesión se conserva al recargar la página hasta que el usuario cierre sesión. | Todas | Media |

## 3.4 Compra

| ID | Requisito | Vista | Prioridad |
|-------|-------------------------------|---------------|-------|
| RF-22 | El checkout solicita nombre, correo, teléfono y número de tarjeta. | `/checkout` | Alta |
| RF-23 | El sistema valida los datos antes de procesar el pago: nombre obligatorio, correo con formato válido, teléfono chileno de 9 dígitos que comienza con 9, y tarjeta de 16 dígitos. | `/checkout` | Alta |
| RF-24 | Si el usuario eligió despacho, el checkout exige una dirección. | `/checkout` | Alta |
| RF-25 | El usuario elige entre retiro en tienda (sin costo) y despacho a domicilio ($3.990). El total cambia según la opción. | `/checkout` | Alta |
| RF-26 | Si hay sesión iniciada, el checkout completa automáticamente los datos del cliente. | `/checkout` | Media |
| RF-27 | El sistema procesa el pago simulado: rechaza las tarjetas que comienzan con `0000` y aprueba las demás. | `/checkout` | Alta |
| RF-28 | Si el pago es aprobado, el sistema registra el pedido y vacía el carrito. | `/checkout` | Alta |
| RF-29 | Si el pago es rechazado, el sistema muestra la compra fallida y conserva el carrito para reintentar. | `/compra-fallida` | Alta |
| RF-30 | La compra exitosa muestra el número de pedido, los productos, la entrega y el total. | `/compra-exitosa/:idPedido` | Alta |
| RF-31 | El número de tarjeta no se guarda en ningún registro del pedido. | Datos | Alta |

## 3.5 Panel de administración

| ID | Requisito | Vista | Prioridad |
|-------|-------------------------------|---------------|-------|
| RF-32 | El administrador puede ver la lista de productos con su imagen, categoría, precio y descuento. | `/admin` | Alta |
| RF-33 | El administrador puede crear un producto nuevo. | `/admin/productos/nuevo` | Alta |
| RF-34 | El administrador puede editar los datos de un producto existente. | `/admin/productos/:id/editar` | Alta |
| RF-35 | El administrador puede eliminar un producto, previa confirmación del usuario. | `/admin` | Alta |
| RF-36 | El sistema valida los datos de producto: nombre obligatorio, precio entero mayor que 0, descuento entero entre 0 y 100, y categoría válida. | `/admin/productos/...` | Alta |
| RF-37 | Las rutas del panel solo son accesibles para usuarios con rol administrador; cualquier otro usuario es redirigido al inicio de sesión. | `/admin/*` | Alta |

# 4. Requisitos no funcionales

| ID | Categoría | Requisito | Verificación |
|-------|----------|-----------------------------|---------------|
| RNF-01 | Usabilidad / Responsividad | La interfaz se adapta a móvil (375 px), tablet (768 px) y escritorio (1280 px) usando Bootstrap 5.3. | Capturas en tres anchos, `docs/capturas/` |
| RNF-02 | Mantenibilidad | Cada componente tiene una responsabilidad clara y recibe sus datos mediante props. | Revisión de código y estructura de carpetas |
| RNF-03 | Mantenibilidad | La lógica de negocio (precios, carrito, validaciones, filtros) está separada de la interfaz como funciones puras. | Pruebas unitarias sobre `utils/` |
| RNF-04 | Calidad | Cobertura de pruebas unitarias de al menos 90 % de las líneas de código. | `npm run test:coverage`; resultado: 95,9 % (fuente: `docs/cobertura.txt`; análisis en `docs/Documento-Testing`) |
| RNF-05 | Calidad | Todas las pruebas unitarias deben pasar antes de cada entrega. | `npm test`; resultado: 93 de 93 en 10 ejecuciones locales consecutivas |
| RNF-06 | Persistencia | El carrito, la sesión, los productos y los pedidos se conservan en localStorage entre recargas. | Pruebas de persistencia en `carritoContext.spec.jsx`, `authContext.spec.jsx` y `baseDeDatos.spec.js` |
| RNF-07 | Seguridad (simulada) | La sesión guardada no contiene la contraseña del usuario. | Prueba en `authContext.spec.jsx` |
| RNF-08 | Seguridad (simulada) | El número de tarjeta no se almacena en el pedido. | Revisión del código de `PaginaCheckout.jsx` |
| RNF-09 | Rendimiento | Todas las operaciones son locales y síncronas, sin llamadas de red. No se midieron tiempos de respuesta. | Revisión de código (no hay llamadas de red); sin mediciones de rendimiento |
| RNF-10 | Compatibilidad | Está pensado para navegadores modernos con soporte de ES2020, localStorage y React 18. Solo se ha verificado en Chrome. | Pruebas automáticas en Chrome headless; no se probó en otros navegadores |
| RNF-11 | Portabilidad | Se instala y ejecuta con `npm install` y `npm run dev`, con Node.js 18 o superior (requisito declarado en el `README.md`). | Desarrollo y pruebas en macOS; en Linux se comprobaron `npm ci`, `npm run build` y las pruebas sobre un clon limpio. No se probó en Windows ni con Node.js 18 |

# 5. Modelo de datos

Los datos se almacenan en cuatro claves de localStorage. Los valores se serializan en JSON.

## 5.1 Producto (`fuma_productos`)

| Campo | Tipo | Descripción |
|-------------|----------|-------------------------------------|
| id | número | Identificador único, asignado automáticamente (máximo + 1). |
| nombre | texto | Nombre del producto. Obligatorio. |
| descripcion | texto | Descripción breve. |
| precio | número entero | Precio original en CLP. Mayor que 0. |
| descuentoPorcentaje | número entero | Porcentaje de descuento entre 0 y 100. 0 = sin oferta. |
| idCategoria | texto | Identificador de la categoría (por ejemplo, "poleras"). |
| imagen | texto | Ruta de la imagen del producto. |

## 5.2 Categoría (dato fijo, `datosIniciales.js`)

| Campo | Tipo | Descripción |
|-------------|----------|-------------------------------------|
| id | texto | Identificador usado en la URL, por ejemplo "polerones". |
| nombre | texto | Nombre visible. |
| descripcion | texto | Descripción breve. |

Categorías definidas: Polerones, Poleras, Pantalones y Accesorios.

## 5.3 Ítem del carrito (`fuma_carrito`)

| Campo | Tipo | Descripción |
|-------------|----------|-------------------------------------|
| idProducto | número | Referencia al producto. |
| nombre | texto | Copia del nombre al momento de agregar. |
| imagen | texto | Copia de la ruta de imagen. |
| precioUnitario | número entero | Precio final (con descuento aplicado) al momento de agregar. |
| cantidad | número entero | Mayor o igual que 1. |

## 5.4 Pedido (`fuma_pedidos`)

| Campo | Tipo | Descripción |
|-------------|----------|-------------------------------------|
| id | número | Número de pedido, asignado automáticamente. |
| fecha | texto ISO | Fecha y hora de creación. |
| cliente | objeto | Nombre, correo y teléfono del cliente. |
| direccion | texto o nulo | Dirección de despacho; nulo cuando el retiro es en tienda. |
| opcionEntrega | texto | "retiro" o "despacho". |
| items | arreglo | Ítems del carrito al momento de la compra. |
| subtotal, costoEnvio, total | número entero | Montos del pedido en CLP. |

## 5.5 Usuario (`fuma_sesion` y datos fijos)

La sesión guarda solo id, nombre, correo, teléfono, dirección y rol. La contraseña se verifica contra la lista de usuarios simulados y **nunca se guarda en la sesión**.

| Usuario de prueba | Correo | Rol |
|------------------|------------------------|------------------|
| Cliente Demo | cliente@fuma.cl | cliente |
| Administrador Fuma | admin@fuma.cl | admin |

# 6. Trazabilidad

La tabla relaciona cada requisito funcional con los componentes que lo implementan y las pruebas que lo verifican.

| Requisito | Componentes y funciones principales | Pruebas |
|---------|---------------------------|------------------------|
| RF-01 | `PaginaProductos`, `ListaProductos`, `TarjetaProducto` | `paginasCatalogo.spec.jsx`, `componentesProductos.spec.jsx` |
| RF-02 | `BarraBusqueda`, `filtrarPorTexto` | `paginasCatalogo.spec.jsx`, `filtros.spec.js`, `componentesProductos.spec.jsx` |
| RF-03 | `PaginaCategorias`, `FiltroCategorias`, `filtrarPorCategoria` | `paginasCatalogo.spec.jsx`, `filtros.spec.js` |
| RF-04 | `PaginaOfertas`, `obtenerOfertas` | `paginasCatalogo.spec.jsx`, `filtros.spec.js` |
| RF-05 | `PaginaDetalleProducto`, `obtenerProductoPorId` | `rutas.spec.jsx`, `casosLimite.spec.jsx` |
| RF-06 | `PrecioProducto`, `calcularPrecioFinal` | `componentesProductos.spec.jsx`, `precios.spec.js` |
| RF-07 | `App.jsx` (ruta `*`), `PaginaNoEncontrada` | `rutas.spec.jsx` |
| RF-08 | `BarraNavegacion` | `BarraNavegacion.spec.jsx` |
| RF-09 | `CarritoProvider.agregarAlCarrito`, `agregarItem` | `carritoContext.spec.jsx`, `carrito.spec.js` |
| RF-10 | `agregarItem` | `carrito.spec.js` |
| RF-11 | `SelectorCantidad`, `ItemCarrito`, `cambiarCantidad` | `carritoUI.spec.jsx`, `carrito.spec.js` |
| RF-12 | `ItemCarrito`, `eliminarItem` | `casosLimite.spec.jsx`, `carrito.spec.js` |
| RF-13 | `PaginaCarrito`, `vaciarCarrito` | `carritoUI.spec.jsx`, `casosLimite.spec.jsx` |
| RF-14 | `ResumenPedido`, `calcularSubtotal` | `carritoUI.spec.jsx`, `precios.spec.js` |
| RF-15 | `BarraNavegacion` (insignia), `CarritoProvider.cantidadTotal` | `BarraNavegacion.spec.jsx`, `carritoContext.spec.jsx` |
| RF-16 | `CarritoProvider` (sincronización con localStorage) | `carritoContext.spec.jsx` |
| RF-17 | `PaginaLogin`, `FormularioLogin`, `AuthProvider.iniciarSesion` | `login.spec.jsx`, `authContext.spec.jsx` |
| RF-18 | `PaginaLogin` (validación y mensaje de error) | `login.spec.jsx` |
| RF-19 | `PaginaLogin` (redirección según rol) | Revisión de código (no hay prueba automática de un inicio de sesión exitoso) |
| RF-20 | `BarraNavegacion` (saludo y cierre de sesión), `AuthProvider.cerrarSesion` | `BarraNavegacion.spec.jsx` (cierre de sesión), `authContext.spec.jsx`; el saludo "Hola, nombre" se verifica por revisión de código |
| RF-21 | `AuthProvider` (leerSesionGuardada) | `authContext.spec.jsx` |
| RF-22 | `FormularioCheckout`, `CampoFormulario` | `checkout.spec.jsx` |
| RF-23 | `validarDatosCheckout` | `validaciones.spec.js`, `checkout.spec.jsx`; el formato del teléfono se verifica por revisión de código (las pruebas cubren el teléfono vacío) |
| RF-24 | `validarDatosCheckout` (dirección condicional), `FormularioCheckout` | `validaciones.spec.js`, `checkout.spec.jsx` |
| RF-25 | `FormularioCheckout` (opciones de entrega), `calcularTotales` | `checkout.spec.jsx`, `precios.spec.js` |
| RF-26 | `PaginaCheckout` (datosIniciales desde el usuario) | `checkout.spec.jsx` |
| RF-27 | `pagoEsAprobado` | `validaciones.spec.js`, `checkout.spec.jsx` |
| RF-28 | `PaginaCheckout.finalizarCompra`, `crearPedido` | `checkout.spec.jsx`, `baseDeDatos.spec.js` |
| RF-29 | `PaginaCompraFallida` | `checkout.spec.jsx` (muestra la compra fallida); la conservación del carrito se verifica por revisión de código |
| RF-30 | `PaginaCompraExitosa`, `obtenerPedidoPorId` | `casosLimite.spec.jsx`, `checkout.spec.jsx` |
| RF-31 | `PaginaCheckout` (pedido sin número de tarjeta) | Revisión de código |
| RF-32 | `PaginaAdmin`, `TablaProductosAdmin` | `adminCrud.spec.jsx` |
| RF-33 | `PaginaAdminProductoFormulario`, `FormularioProducto`, `crearProducto` | `adminCrud.spec.jsx`, `baseDeDatos.spec.js` |
| RF-34 | `PaginaAdminProductoFormulario`, `actualizarProducto` | `adminCrud.spec.jsx`, `baseDeDatos.spec.js` |
| RF-35 | `TablaProductosAdmin` (confirmación), `eliminarProducto` | `adminCrud.spec.jsx`, `casosLimite.spec.jsx`, `baseDeDatos.spec.js` |
| RF-36 | `validarProducto` | `adminCrud.spec.jsx`; el rango del descuento se verifica por revisión de código |
| RF-37 | `RutaAdmin`, `App.jsx` | `adminCrud.spec.jsx` (`RutaAdmin`) |

# 7. Criterios de aceptación generales

1. Todas las pruebas unitarias pasan con `npm test` (93 de 93).
2. La cobertura de líneas es igual o superior al 90 % (resultado actual: 95,9 %).
3. Las vistas principales se ven completas, sin desbordes horizontales, en 375, 768 y 1280 px.
4. Un cliente puede completar el recorrido: buscar un producto, agregarlo, ajustar la cantidad, pagar con una tarjeta válida y ver la compra exitosa.
5. Con una tarjeta que empieza con `0000`, el sistema muestra la compra fallida y el carrito conserva sus productos.
6. Un administrador puede crear, editar y eliminar un producto, y los cambios se reflejan en el catálogo tras recargar la página.
7. Un usuario sin sesión de administrador no puede acceder al panel escribiendo la URL.

# 8. Control de cambios

| Versión | Fecha | Descripción del cambio | Autor |
|------|--------|----------------------------------|------------|
| 2.0 | Octubre 2026 | Versión final del documento para la Evaluación Parcial 2. Refleja la implementación completa: catálogo, carrito, sesión, checkout, panel administrativo y pruebas unitarias. | Vicente Mendoza |
| 2.1 | Octubre 2026 | Revisión de afirmaciones: la trazabilidad se ajusta a lo que verifican las pruebas, los requisitos RNF-09, RNF-10 y RNF-11 se acotan a lo comprobado y se referencia `docs/Documento-Testing`. Sin cambios de funcionalidad. | Vicente Mendoza |
| 2.2 | Octubre 2026 | Se agregan imágenes a los 8 productos iniciales y se actualiza el supuesto S-03. Sin cambios de lógica. | Vicente Mendoza |
| 2.3 | 29 de octubre de 2026 | Se agrega el informe técnico del frontend (`docs/Informe-Frontend`) a las referencias. La lista de productos del panel de administración muestra una miniatura de la imagen (RF-32) y las fotos de producto se muestran en recuadro cuadrado. Se incorpora a Isai Sepulveda como autor. | Vicente Mendoza e Isai Sepulveda |

# 9. Anexo: resumen de la implementación

| Métrica | Valor |
|------------------------------------|------------------------|
| Pruebas unitarias | 93 (todas en verde) |
| Cobertura de líneas | 95,9 % |
| Cobertura de sentencias | 96,2 % |
| Cobertura de ramas | 90,7 % |
| Cobertura de funciones | 95,8 % |
| Rutas de la aplicación | 15 |
| Productos semilla | 8 |
| Categorías | 4 |
| Capturas de diseño responsivo | 24 (8 vistas × 3 anchos) |
