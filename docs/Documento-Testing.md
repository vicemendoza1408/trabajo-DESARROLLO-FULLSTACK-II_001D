---
title: "Documento de testing y cobertura"
subtitle: "Tienda online Fuma · DSY1104 Desarrollo Fullstack II · Evaluación Parcial 2"
author: "Vicente Mendoza e Isai Sepulveda"
date: "29 de octubre de 2026"
lang: es
---

# 1. Objetivo y alcance

## 1.1 Objetivo

Este documento describe cómo se probó el frontend de **Fuma** con pruebas unitarias automatizadas: qué herramientas se usan, cómo se configuran, qué pruebas existen, qué resultados y cobertura se obtuvieron y qué limitaciones tiene el proceso. Es el documento de cobertura de testing que pide la Evaluación Parcial 2 y sirve de apoyo para los indicadores IE2.2.1, IE2.2.2, IE2.3.1 e IE2.3.2.

## 1.2 Qué se prueba

El proyecto tiene **17 archivos de prueba (`*.spec`) y 93 pruebas** (conteo de los `it` en `src/tests/`). Se prueban cuatro capas:

| Capa | Carpeta | Cómo se prueba |
|---|---|---|
| Lógica pura | `src/utils/` | Se llama a la función y se comparan los valores devueltos. No hay React ni DOM. |
| Datos simulados (CRUD) | `src/data/` | Se llama a las funciones de `baseDeDatos.js` con `localStorage` limpio. |
| Estado global | `src/context/` | Se monta el proveedor con un componente de prueba y se observa la pantalla. |
| Componentes y páginas | `src/components/`, `src/pages/` | Se renderizan, se simulan eventos y se revisa el DOM resultante. |

## 1.3 Qué no se prueba

- **Pruebas de extremo a extremo** (recorrer la aplicación en un navegador real con la aplicación servida): no existen.
- **El diseño responsivo**: Karma no mide el aspecto visual. Se revisó manualmente con capturas en tres anchos (ver sección 12).
- **Otros navegadores o sistemas operativos**: las pruebas se ejecutaron en Chrome headless (ver sección 9.1).
- **Backend**: no existe. Los datos se simulan con `localStorage`.

## 1.4 Cómo se distingue el origen de cada dato

Para no afirmar más de lo que hay evidencia, este documento etiqueta el estado de cada afirmación importante:

| Etiqueta | Significado |
|---|---|
| **Implementado** | Existe en el código del repositorio. |
| **Probado automáticamente** | Una prueba de `src/tests/` lo verifica. |
| **Verificado manualmente** | Lo revisó una persona (ejecuciones locales, capturas). |
| **Planificado** | Se propone, pero aún no existe. |

# 2. Herramientas y versiones

Versiones tomadas de `package.json` (dependencias fijas, sin rangos, salvo `babel-plugin-istanbul`, que usa `^7.0.0`).

| Herramienta | Versión | Para qué se usa |
|---|---|---|
| React / React DOM | 18.3.1 | Aplicación bajo prueba. |
| React Router DOM | 6.28.0 | Navegación; en pruebas se usa `MemoryRouter`. |
| Bootstrap | 5.3.3 | Estilos (solo CSS, importado en `main.jsx`). |
| jasmine-core | 5.4.0 | Framework de pruebas: `describe`, `it`, `expect`, spies. |
| karma | 6.4.4 | Ejecutor: abre el navegador, corre las pruebas e informa. |
| karma-jasmine | 5.1.0 | Conecta Karma con Jasmine. |
| karma-chrome-launcher | 3.2.0 | Permite que Karma lance Chrome. |
| karma-webpack | 5.0.1 | Empaqueta las pruebas antes de correrlas. |
| webpack | 5.97.1 | Empaquetador usado solo para las pruebas. |
| babel-loader, @babel/core, @babel/preset-env, @babel/preset-react | 9.2.1, 7.26.0, 7.26.0, 7.25.9 | Traducen JSX y JavaScript moderno a código que Chrome ejecuta. |
| css-loader, style-loader | 7.1.2, 4.0.0 | Permiten que los componentes importen CSS durante las pruebas. |
| @testing-library/react, @testing-library/dom | 16.1.0, 10.4.0 | Renderizar componentes y consultar el DOM como lo vería un usuario. |
| karma-spec-reporter | 0.0.36 | Muestra cada prueba en la consola con su resultado. |
| karma-coverage, babel-plugin-istanbul | 2.2.1, ^7.0.0 | Medición de cobertura con Istanbul. |

# 3. Qué es cada herramienta y cada concepto

Esta sección existe para poder explicar con precisión la diferencia entre piezas que suelen confundirse.

| Término | Qué es | Qué NO es |
|-----|--------------|--------|
| **Jasmine** | El *framework* de pruebas. Aporta `describe` (agrupar), `it` (una prueba), `expect` (comprobar), `beforeEach` (preparar) y los *spies*. También decide el orden de ejecución. | No abre navegadores ni renderiza componentes. |
| **Karma** | El *ejecutor* (*test runner*). Lanza Chrome, le entrega las pruebas empaquetadas, recoge los resultados y los imprime. | No define qué es una prueba ni comprueba nada por sí mismo. |
| **Testing Library** | Una librería para **renderizar** un componente y **consultar su DOM** de forma parecida a un usuario (`getByRole`, `getByLabelText`, `getByText`) y para simular eventos (`fireEvent`). | No ejecuta pruebas ni tiene `expect`: las comprobaciones las hace Jasmine. |
| **Spy** | Función "espía" que **registra cómo la llamaron** (cuántas veces y con qué argumentos). Se crea con `jasmine.createSpy` o con `spyOn`. | No decide por sí sola si la prueba pasa: lo hace el `expect` que lee sus registros. |
| **Stub** | Sustituto que **devuelve una respuesta programada**, por ejemplo `spyOn(window, "confirm").and.returnValue(true)`. | No simula comportamiento complejo, solo una respuesta fija. |
| **Mock** | En sentido estricto, un doble de prueba con **expectativas preprogramadas** que él mismo verifica (estilo Sinon o Mockito). **Jasmine no ofrece esa API y el proyecto no la usa.** En la rúbrica "mock" se usa como nombre genérico de doble de prueba; técnicamente, los dobles de este proyecto son **spies y stubs**. | No debe llamarse mock a un spy simple ni a `localStorage`. |
| **Dummy** | Valor de relleno que solo satisface la firma, como `onEliminar={() => {}}` cuando la prueba no mira esa función. | No se verifica. |
| **Componente de prueba** | Pequeño componente escrito en el spec (`ContadorDePrueba`, `SesionDePrueba`, `AccionesCarritoDePrueba`) que consume un contexto para poder probarlo. | No es un mock: usa el contexto real. |
| **`MemoryRouter`** | Un **router real** de React Router que guarda la ruta en memoria en lugar de en la barra del navegador. Da el contexto que necesitan `Link`, `NavLink`, `Routes` y `useParams`. | No es un mock ni un espía. |
| **`localStorage`** | El almacenamiento **real** de Chrome. Las pruebas lo leen, lo escriben y lo vacían. Solo en una prueba se espía su método `setItem`, y con `.and.callThrough()`, o sea que la escritura real ocurre. | No está reemplazado por una versión falsa. |
| **Cobertura (Istanbul)** | Medición de **qué líneas, ramas, funciones y sentencias del código de la aplicación se ejecutaron** durante las pruebas. `babel-plugin-istanbul` instrumenta el código y `karma-coverage` genera el informe. | No mide la calidad de las comprobaciones: una línea ejecutada no está necesariamente bien verificada. |
| **Aislamiento con `beforeEach`** | Un bloque que Jasmine ejecuta **antes de cada `it`** de su `describe`. Aquí limpia `localStorage` para que cada prueba parta de cero. | No reemplaza el orden aleatorio: lo hace seguro. |

# 4. Configuración y ejecución

## 4.1 Cómo funciona la cadena de ejecución

1. `npm test` ejecuta `karma start karma.conf.cjs`.
2. Karma toma **un solo archivo de entrada**, `src/tests/index.js`, que con `import.meta.webpackContext` importa automáticamente todos los archivos `*.spec.js` y `*.spec.jsx` de la carpeta. Agregar un spec nuevo no exige registrarlo.
3. **webpack con `babel-loader`** empaqueta ese archivo. Es necesario porque el código de la aplicación está escrito en JSX y con `import`, y Chrome no entiende JSX.
4. Karma lanza **Chrome sin interfaz** (*headless*) con el lanzador `ChromeHeadlessCI` (banderas `--no-sandbox` y `--disable-gpu`).
5. Jasmine ejecuta las pruebas dentro de esa página de Chrome.
6. El *reporter* `spec` imprime cada prueba y un resumen final (`TOTAL: 93 SUCCESS` cuando todas pasan).

## 4.2 Archivos de configuración reales

| Archivo | Qué hace |
|---|---|
| `karma.conf.cjs` | Configura frameworks (`jasmine`, `webpack`), el archivo de entrada, las reglas de Babel y CSS, los reporters, el lanzador de Chrome, `singleRun: true` y un `browserNoActivityTimeout` de 60 s. |
| `src/tests/index.js` | Punto de entrada que carga todos los specs. |
| `package.json` | Scripts `test` y `test:coverage` y las versiones de las herramientas. |

El proyecto no usa un `webpack.test.config.cjs` aparte: la configuración de webpack está dentro de `karma.conf.cjs`.

## 4.3 Comandos

```bash
npm install                # instala dependencias
npm test                   # una pasada en Chrome headless
npm run test:coverage      # lo mismo, con informe de cobertura
```

- Con `--coverage`, Babel agrega `babel-plugin-istanbul` (excluyendo `src/tests/**`) y Karma suma el reporter `coverage`, que produce un resumen en consola y un informe HTML en `coverage/`.
- La carpeta `coverage/` está en `.gitignore`: se genera, no se versiona.
- Si Karma no encuentra Chrome, se define la variable de entorno `CHROME_BIN` con la ruta del ejecutable (esto también está en el `README.md`).

## 4.4 Orden de ejecución

`karma.conf.cjs` no configura la opción `random` de Jasmine, así que se aplica el valor por defecto de Jasmine 5: **las pruebas se ejecutan en orden aleatorio**. El proyecto no lo desactiva. Esto es deseable (descubre dependencias ocultas entre pruebas) y es la razón del trabajo de aislamiento de la sección 11.

# 5. Estrategia de pruebas

## 5.1 Patrón Arrange–Act–Assert

Cada prueba sigue tres pasos:

1. **Arrange (preparar):** crear los datos y renderizar el componente.
2. **Act (actuar):** hacer lo que haría el usuario o llamar a la función.
3. **Assert (comprobar):** verificar con `expect` el resultado.

## 5.2 Tipos de prueba usados

| Tipo | Qué verifica | Ejemplo |
|---|---|---|
| Renderizado | Que el componente muestre los datos recibidos. | Una tarjeta por producto. |
| Renderizado condicional | Que algo aparezca o desaparezca según una condición. | El error solo se ve si hay error. |
| Props | Que el componente use lo que recibe, incluidas funciones (*callbacks*). | `onAgregarAlCarrito` recibe el producto. |
| Estado | Que la interfaz cambie cuando cambia el estado. | El menú se abre y cierra. |
| Eventos | Que un clic o un cambio produzca el efecto esperado. | Pulsar "Pagar". |
| Formularios y validación | Errores visibles y envío bloqueado. | Checkout vacío. |
| Lógica pura | Valores devueltos por funciones sin efectos. | `agregarItem`, `calcularTotales`. |
| Contexto y persistencia | Estado global y escritura en `localStorage`. | Contador del carrito. |
| CRUD | Crear, leer, actualizar y eliminar en la base simulada. | `baseDeDatos.spec.js`. |
| Rutas | Que la URL muestre la página correcta. | `/productos/7`, ruta inexistente. |
| Flujo | Varias piezas juntas, de la acción al resultado. | Pago aprobado y rechazado. |

## 5.2.1 Cómo se consulta el DOM

Se prefiere buscar por **rol y nombre accesible** (`getByRole("button", { name: "Pagar" })`) o por etiqueta (`getByLabelText("Nombre")`), como lo haría un usuario o un lector de pantalla. Solo cuando hace falta revisar una clase CSS (por ejemplo `show` o `invalid-feedback`) se usa `querySelector`.

# 6. Las 10 pruebas destacadas

Son las pruebas elegidas para explicar y mostrar en la defensa. La rúbrica menciona 10 pruebas; el proyecto tiene 93 y **no se eliminó ninguna** (las otras 83 completan la cobertura). Las 10 cubren renderizado, renderizado condicional, props, estado, eventos, formularios, validación, lógica pura, Context, CRUD con persistencia y dobles de prueba.

**Resultado de las 10 pruebas.** Las 93 pruebas terminaron con `TOTAL: 93 SUCCESS` en 10 ejecuciones locales consecutivas hechas por el autor en su Mac después del commit `2290d86` (5 con `npm test` y 5 con `npm run test:coverage`). Como esas ejecuciones pasaron todas las pruebas, cada una de las 10 pasó. **No se conserva en el repositorio una salida detallada prueba por prueba**, por lo que este documento no transcribe una.

## Prueba 1: la lista renderiza una tarjeta por cada producto

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/componentesProductos.spec.jsx` |
| Grupo y prueba | `ListaProductos` → "renderiza una tarjeta por cada producto" |
| Objetivo | Comprobar que el componente de lista muestra un elemento por cada dato que recibe. |
| Arrange | Un arreglo de 3 productos (uno base y dos copias con otro `id` y `nombre`). Se renderiza `<ListaProductos productos={...} onAgregarAlCarrito={() => {}} />`; la función vacía es un *dummy*. |
| Act | Renderizar el componente (aquí no hay interacción: el render es la acción). |
| Assert | `screen.getAllByRole("button", { name: "Agregar" }).length` es `3`. |
| Concepto | Renderizado de lista a partir de props. |
| Rúbrica | IE2.2.1 e IE2.2.2 (renderizado; es la tarea de lista del Anexo). IE2.1.2 (props). |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "Le paso tres productos y verifico que aparecen tres tarjetas. Cuento los botones *Agregar* porque cada tarjeta tiene exactamente uno." *Limitación honesta:* cuenta botones como indicador de tarjetas; no cuenta tarjetas directamente. |

## Prueba 2: el mensaje de error solo aparece cuando hay error

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/login.spec.jsx` |
| Grupo y prueba | `CampoFormulario` → "muestra el mensaje de error solo cuando hay un error" |
| Objetivo | Verificar el renderizado condicional del mensaje de error de un campo. |
| Arrange | Se renderiza `CampoFormulario` **sin** la prop `error`. |
| Act | Se vuelve a renderizar el mismo componente con `rerender`, ahora con `error="Ingresa un correo."`. |
| Assert | Antes: no existe ningún elemento `.invalid-feedback`. Después: el texto "Ingresa un correo." está en pantalla. |
| Concepto | Renderizado condicional; el mismo componente reacciona a props distintas. |
| Rúbrica | IE2.2.1 e IE2.2.2 (condicional; es la tarea de error del Anexo). IE2.1.2 (props). |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "El componente decide por una prop si dibuja el error. Pruebo los dos casos: sin error no hay nada; con error aparece el texto." |

## Prueba 3: pulsar Agregar llama a la función con el producto

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/componentesProductos.spec.jsx` |
| Grupo y prueba | `TarjetaProducto` → "llama a onAgregarAlCarrito con el producto al pulsar Agregar" |
| Objetivo | Comprobar que el componente avisa al padre, mediante una prop de función, cuál producto se quiere agregar. |
| Arrange | Un *spy* `jasmine.createSpy("onAgregarAlCarrito")` pasado como prop, y un producto de prueba. |
| Act | `fireEvent.click` sobre el botón "Agregar". |
| Assert | `expect(espiaAgregar).toHaveBeenCalledOnceWith(producto)`: una sola llamada, con ese producto. |
| Concepto | Props de tipo función (*callbacks*), eventos y *spy*. La tarjeta se prueba aislada: no usa el carrito real. |
| Rúbrica | IE2.2.1 e IE2.2.2 (props y eventos, tarea del botón del Anexo). IE2.3.1 e IE2.3.2 (uso de un spy). |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "La tarjeta no sabe qué es un carrito: solo recibe una función. Le doy una función espía y compruebo que la llamó una vez con el producto correcto." |

## Prueba 4: el menú de la barra se abre y se cierra

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/BarraNavegacion.spec.jsx` |
| Grupo y prueba | `BarraNavegacion` → "abre y cierra el menú al hacer clic en el botón" |
| Objetivo | Verificar que el estado `menuAbierto` cambia la interfaz. |
| Arrange | Se renderiza la barra dentro de `MemoryRouter` (porque usa `Link` y `NavLink`). Se obtiene el botón "Abrir menú" y el contenedor `.navbar-collapse`. |
| Act | Dos clics en el botón, uno tras otro. |
| Assert | Al inicio el contenedor no tiene la clase `show`. Tras el primer clic la tiene y `aria-expanded` vale `"true"`. Tras el segundo clic ya no la tiene. |
| Concepto | Estado local (`useState`), re-renderizado, revisión del DOM y accesibilidad (`aria-expanded`). |
| Rúbrica | IE2.2.1 e IE2.2.2 (estado, eventos, DOM). IE2.1.4 (estado y responsivo: el menú colapsable es el de Bootstrap móvil). |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "Bootstrap se importa solo como CSS, así que quien abre y cierra el menú es el estado de React, que agrega o quita la clase `show`. Pruebo el ciclo completo." |

## Prueba 5: el checkout vacío muestra errores y no confirma

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/checkout.spec.jsx` |
| Grupo y prueba | `FormularioCheckout` → "muestra errores y no confirma cuando el formulario está vacío" |
| Objetivo | Comprobar que la validación bloquea el envío de un formulario incompleto. |
| Arrange | Un spy `onConfirmar`; se renderiza el formulario con `opcionEntrega="retiro"` y una función dummy para `onCambiarEntrega`. |
| Act | Clic en el botón "Pagar" con todos los campos vacíos. |
| Assert | `onConfirmar` **no** fue llamado y el mensaje "Ingresa tu nombre." está visible. |
| Concepto | Validación de formulario, evento de envío, estado de errores y comprobación negativa con un spy. |
| Rúbrica | IE2.2.1 e IE2.2.2 (formularios y eventos). IE2.1.2 (estado local `errores`). IE2.3.1 (spy). |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "Pruebo el camino negativo: si faltan datos, el formulario muestra errores y nunca avisa que está listo para pagar." |

## Prueba 6: la dirección solo se exige con despacho

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/validaciones.spec.js` |
| Grupo y prueba | `validarDatosCheckout` → "exige dirección solo cuando el despacho es a domicilio" |
| Objetivo | Verificar una regla de negocio de la validación (RF-24). |
| Arrange | Datos válidos con `direccion` vacía. |
| Act | Se llama dos veces a `validarDatosCheckout`: una con `opcionEntrega: "despacho"` y otra con `"retiro"`. |
| Assert | Con despacho, el objeto de errores tiene `direccion`. Con retiro, `direccion` es `undefined`. |
| Concepto | Lógica pura: una función sin React ni DOM, con dos casos que cubren los dos lados de una condición. |
| Rúbrica | IE2.2.1 e IE2.2.2 (lógica). Respalda RF-24. |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "Sacar la validación a una función pura permite probarla sin renderizar nada: entran datos, sale un objeto de errores." *Limitación honesta:* `toBeDefined` comprueba que hay error, no el texto del mensaje (ese texto sí se verifica en la prueba 5). |

## Prueba 7: agregar un producto repetido suma la cantidad

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/carrito.spec.js` |
| Grupo y prueba | `carrito` → "suma cantidad cuando el producto ya estaba en el carrito" |
| Objetivo | Verificar que no se duplican líneas en el carrito (RF-10). |
| Arrange | Un producto y un carrito con ese producto una vez: `agregarItem([], polera)`. |
| Act | `agregarItem(conUno, polera)`. |
| Assert | El resultado tiene 1 línea y su `cantidad` es 2. |
| Concepto | Lógica pura de una regla de negocio. La misma suite incluye "no modifica el arreglo original al agregar" (inmutabilidad), que es lo que permite a React detectar el cambio. |
| Rúbrica | IE2.2.1 e IE2.2.2 (lógica). Respalda RF-09 y RF-10. |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "El carrito es un arreglo y las funciones devuelven uno nuevo en vez de modificar el anterior. Eso las hace fáciles de probar." |

## Prueba 8: el contador del carrito sube al agregar

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/carritoContext.spec.jsx` |
| Grupo y prueba | `CarritoProvider` → "aumenta el contador al agregar un producto" |
| Objetivo | Verificar que el estado global del carrito se refleja en la pantalla. |
| Arrange | `beforeEach` vacía `localStorage`. Se renderiza `<CarritoProvider>` con un **componente de prueba** (`ContadorDePrueba`) que usa `useCarrito()` y muestra "Cantidad: N". |
| Act | Dos clics en el botón "Agregar" del componente de prueba. |
| Assert | Tras el primer clic aparece "Cantidad: 1"; tras el segundo, "Cantidad: 2". |
| Concepto | Estado global con Context API, hook personalizado y re-renderizado. El proveedor es el real; el componente de prueba solo lo consume. |
| Rúbrica | IE2.2.1 e IE2.2.2 (estado y eventos). IE2.1.2 (gestión de estado). IE2.3.1 (aislamiento con `beforeEach`). |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "El estado vive en el proveedor, no en cada página. Pruebo el proveedor real con un componente mínimo que lo usa. La persistencia se verifica en otra prueba del mismo archivo." |

## Prueba 9: crear un producto guarda en localStorage (spy de `setItem`)

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/baseDeDatos.spec.js` |
| Grupo y prueba | `baseDeDatos (CRUD de productos)` → "guarda los cambios en localStorage al crear (mock de setItem)" |
| Objetivo | Verificar que una operación del CRUD escribe en el almacenamiento. |
| Arrange | `beforeEach` vacía `localStorage`. `spyOn(window.localStorage, "setItem").and.callThrough()`. |
| Act | `crearProducto({ nombre: "Cinturón", precio: 1000, ... })`. |
| Assert | El spy fue llamado y la clave de la última escritura es `CLAVE_PRODUCTOS` (`"fuma_productos"`). |
| Concepto | CRUD con persistencia y **spy con `callThrough`**: observa la llamada sin impedir que ocurra la escritura real. El nombre de la prueba dice "mock", pero técnicamente es un spy. |
| Rúbrica | IE2.2.1 e IE2.2.2 (CRUD, comportamiento). IE2.3.1 e IE2.3.2 (uso de dobles de prueba). |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "Espío `setItem` para comprobar que crear un producto realmente guarda. Uso `callThrough` para que la escritura sea real." *Limitación honesta:* esta prueba verifica la clave, no el contenido. El contenido lo verifica "crea un producto con id nuevo y lo persiste", del mismo archivo. |

## Prueba 10: eliminar solo ocurre si el usuario confirma

| Campo | Detalle |
|----|----------------|
| Archivo | `src/tests/adminCrud.spec.jsx` |
| Grupo y prueba | `TablaProductosAdmin` → "elimina el producto solo cuando el usuario confirma" (pareja: "no elimina el producto cuando el usuario cancela") |
| Objetivo | Verificar el comportamiento ante la confirmación del navegador antes de borrar (RF-35). |
| Arrange | `spyOn(window, "confirm").and.returnValue(true)`: un **stub** que responde "Aceptar" sin abrir un diálogo real (que detendría la ejecución). Un spy `onEliminar`. La tabla se renderiza en `MemoryRouter` porque contiene enlaces. |
| Act | Clic en el primer botón "Eliminar". |
| Assert | `onEliminar` fue llamado con el id `1`. En la prueba pareja, con `returnValue(false)`, `onEliminar` no es llamado. |
| Concepto | Doble de una API del navegador (`window.confirm`) y comportamiento condicional. Jasmine restaura el método original al terminar cada prueba. |
| Rúbrica | IE2.2.1 e IE2.2.2 (comportamiento, eventos). IE2.3.1 e IE2.3.2 (stub y spy). |
| Resultado | Aprobada (incluida en `TOTAL: 93 SUCCESS`). |
| Para la defensa | "Un `confirm` real bloquearía las pruebas, así que lo reemplazo por una función que responde sí o no. Compruebo que solo se elimina si la respuesta es sí." |

## Resumen: qué demuestra cada una

| # | Prueba | Tipo principal | Doble de prueba |
|---|---|---|---|
| 1 | Lista de tarjetas | Renderizado | dummy |
| 2 | Error condicional | Renderizado condicional | — |
| 3 | Agregar con callback | Props y evento | spy |
| 4 | Menú | Estado y DOM | — |
| 5 | Checkout vacío | Formulario y validación | spy, dummy |
| 6 | Dirección con despacho | Lógica pura | — |
| 7 | Cantidad repetida | Lógica pura | — |
| 8 | Contador del carrito | Context y estado global | — |
| 9 | Guardar al crear | CRUD y persistencia | spy con `callThrough` |
| 10 | Confirmar al eliminar | Comportamiento | stub y spy |

# 7. Resumen de las 93 pruebas por archivo

El listado completo, con el nombre de cada prueba, está en el Anexo A. Se obtuvo leyendo el código fuente de los specs (conteo estático), no de una ejecución.

| Archivo | Pruebas | Qué prueba |
|---|---|---|
| `BarraNavegacion.spec.jsx` | 5 | Menú, insignia del carrito, enlaces, sesión y cierre de sesión. |
| `PaginaInicio.spec.jsx` | 1 | Renderizado de la portada. |
| `adminCrud.spec.jsx` | 10 | Tabla del panel, formulario de producto, protección de rutas y CRUD desde el panel. |
| `authContext.spec.jsx` | 5 | Búsqueda de credenciales y estado de sesión. |
| `baseDeDatos.spec.js` | 6 | CRUD de productos sobre `localStorage`. |
| `carrito.spec.js` | 5 | Funciones puras del carrito. |
| `carritoContext.spec.jsx` | 3 | Estado global del carrito y su persistencia. |
| `carritoUI.spec.jsx` | 10 | Selector de cantidad, ítem, resumen y página del carrito. |
| `casosLimite.spec.jsx` | 7 | Acciones secundarias del carrito, despacho, datos inexistentes y eliminar desde el panel. |
| `checkout.spec.jsx` | 7 | Formulario de checkout y flujo de pago aprobado y rechazado. |
| `componentesProductos.spec.jsx` | 7 | Tarjeta, precio, lista y búsqueda. |
| `filtros.spec.js` | 4 | Filtros de texto, categoría y ofertas. |
| `login.spec.jsx` | 6 | Campo de formulario, alerta, formulario y página de login. |
| `paginasCatalogo.spec.jsx` | 3 | Búsqueda, categorías y ofertas. |
| `precios.spec.js` | 5 | Precio con descuento, totales y formato CLP. |
| `rutas.spec.jsx` | 2 | Producto por URL y página no encontrada. |
| `validaciones.spec.js` | 7 | Validación del checkout y pago simulado. |
| **Total** | **93** | |

Sin `xit`, `fit`, `xdescribe` ni pruebas pendientes (revisado con búsqueda en `src/tests/`).

# 8. Dobles de prueba que existen en el proyecto

Inventario obtenido buscando en `src/tests/`. Incluye solo lo que existe.

| Recurso | Cantidad | Dónde | Para qué |
|---|---|---|---|
| `jasmine.createSpy(...)` (spy sobre callbacks por props) | 15 | `BarraNavegacion`, `casosLimite`, `componentesProductos` (2), `checkout` (2), `adminCrud` (4), `carritoUI` (4), `login` | Comprobar que un componente llama a la función recibida y con qué argumentos. |
| `spyOn(window, "confirm").and.returnValue(...)` (**stub** + spy) | 3 | `adminCrud` (2), `casosLimite` (1) | Responder "Aceptar" o "Cancelar" sin abrir un diálogo real. |
| `spyOn(window.localStorage, "setItem").and.callThrough()` (spy) | 1 | `baseDeDatos` | Verificar que se guarda sin impedir la escritura real. |
| Funciones vacías `() => {}` (**dummy**) | varias | En casi todos los specs de componentes | Rellenar props que la prueba no mira. |
| `MemoryRouter` (router real, no un doble) | en 9 de los 17 specs | Pruebas de componentes con enlaces o rutas | Dar contexto de navegación. |
| Componentes de prueba | 3 | `carritoContext`, `authContext`, `casosLimite` | Consumir un contexto real. |

Lo que **no** hay: un mock con expectativas preprogramadas, módulos reemplazados, un `localStorage` falso ni un backend simulado en las pruebas. `baseDeDatos.js` es una "base de datos simulada" del **código de la aplicación**, no un doble de prueba.

# 9. Resultados de ejecución

## 9.1 Qué evidencia existe

| Dato | Valor | Fuente | Estado |
|---|---|---|---|
| Archivos de prueba y pruebas | 17 y 93 | Conteo del código en `src/tests/` | Implementado |
| Resultado `TOTAL: 93 SUCCESS` | 10 ejecuciones consecutivas, todas exitosas: 5 de `npm test` y 5 de `npm run test:coverage` | **Ejecuciones locales del autor en su Mac, posteriores al commit `2290d86`** | Verificado manualmente |
| Ejecución con salida conservada en la Mac | `Executed 93 of 93 SUCCESS` (`npm test`, 28-oct-2026, 16:37), con el nombre de cada prueba, en Chrome Headless 156.0.0.0 sobre Mac OS 10.15.7. Se hizo con el código de la Fase 14, que respecto de `2290d86` solo cambia comentarios. | `docs/evidencia/salida-karma-mac.txt` | Verificado manualmente (salida conservada) |
| Navegador de las pruebas | Chrome Headless 156.0.0.0 en Mac OS 10.15.7 | Salida anterior y carpeta `coverage/` de la Fase 11 | Evidencia de macOS; ver también la sección 9.3 |
| Métricas de cobertura | Ver sección 10 | `docs/cobertura.txt` | Medido antes del commit `2290d86` |

De las 10 ejecuciones consecutivas de la Mac no se conservó la salida. La única salida detallada de la Mac es la del 28-oct-2026 a las 16:37 (`docs/evidencia/salida-karma-mac.txt`), que es de `npm test` y por tanto no incluye cobertura. Una salida con cobertura posterior a `2290d86`, obtenida en otro entorno, se describe en la sección 9.3.

## 9.2 Cuándo se midió la cobertura y qué cambió después

- `docs/cobertura.txt` se versionó en el commit `8943a25` (Fase 11, 28-oct-2026, 13:03). El archivo tiene fecha de las 13:01.
- El problema de aislamiento se corrigió después, en el commit `2290d86` (14:17).
- Entre `8943a25` y el estado actual, el único cambio en `src/`, `karma.conf.cjs` y `package.json` es el de `2290d86`: **8 líneas agregadas en `src/tests/paginasCatalogo.spec.jsx`**. El código de la aplicación no cambió.

Con eso es razonable esperar que la cobertura del código de la aplicación siga siendo la misma. Las cifras de la sección 10 corresponden a la ejecución anterior al commit; la sección 9.3 aporta una medición posterior, hecha en otro entorno, que coincide.

## 9.3 Verificación adicional en otro entorno (Fase 14)

En la Fase 14 se ejecutó `npm run test:coverage` sobre una copia del proyecto en un entorno **Linux con Chrome Headless 153.0.0.0**, es decir, **no en la Mac del autor**. Fue después del commit `2290d86` y de ajustes de comentarios en 8 archivos de `src/` (sin cambios de lógica). Resultados:

- `Executed 93 of 93 SUCCESS`.
- Cobertura: sentencias 96,18 %, ramas 90,69 %, funciones 95,83 % y líneas 95,85 %. Las filas de la tabla por archivo coinciden una a una con `docs/cobertura.txt`.
- La salida completa, con el nombre de cada prueba, está en `docs/evidencia/salida-karma-linux.txt`. Incluye avisos `WARN` de React Router sobre cambios futuros de la versión 7; son avisos de la librería, no fallas.

Esta ejecución no reemplaza las 10 de la Mac: las complementa con un segundo entorno y con la lista de pruebas por nombre.

# 10. Cobertura

## 10.1 Resumen global

Fuente: `docs/cobertura.txt` (`npm run test:coverage`, 28-oct-2026, anterior al commit `2290d86`).

| Métrica | Porcentaje | Cantidad |
|---|---|---|
| Sentencias (*statements*) | 96,18 % | 328 de 341 |
| Ramas (*branches*) | 90,69 % | 156 de 172 |
| Funciones | 95,83 % | 138 de 144 |
| Líneas | 95,85 % | 301 de 314 |

## 10.2 Por carpeta

| Carpeta | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| `src` (`App.jsx`) | 100 | 100 | 100 | 100 |
| `src/components` | 95,78 | 96,15 | 91,66 | 95,5 |
| `src/context` | 90,9 | 85,71 | 100 | 90 |
| `src/data` | 100 | 100 | 100 | 100 |
| `src/pages` | 95,29 | 77,77 | 96 | 95 |
| `src/utils` | 98,52 | 92,85 | 100 | 98,36 |
| **Total** | **96,18** | **90,69** | **95,83** | **95,85** |

La métrica más baja es la de **ramas en `src/pages` (77,77 %)**: son las páginas, que combinan muchas condiciones.

## 10.3 Lo que no se cubre y por qué

Líneas sin cubrir según `docs/cobertura.txt`; la explicación sale de leer esas líneas en el código.

| Archivo y línea | Qué es | Por qué no se cubre |
|-----|--------|--------|
| `FormularioCheckout.jsx` 47 | `onChange` del radio "Retiro en tienda". | La prueba cambia a despacho, pero ninguna vuelve a retiro. |
| `FormularioCheckout.jsx` 58 | `onCambiar` del campo Dirección. | Ninguna prueba escribe en la dirección. |
| `FormularioProducto.jsx` 59 y 64 | `onCambiar` de descripción y de descuento. | Las pruebas llenan nombre, precio y categoría. |
| `TablaProductosAdmin.jsx` 8 | Rama "Sin categoría". | No hay una prueba con un producto de categoría desconocida. |
| `AuthContext.jsx` 14 y `CarritoContext.jsx` 14 | Rama de respaldo al leer una sesión o un carrito dañados en `localStorage`. | No se prueba un valor guardado inválido. |
| `AuthContext.jsx` 57 y `CarritoContext.jsx` 62 | Error al usar el hook fuera de su proveedor. | Es una protección para el programador; no se prueba. |
| `PaginaAdminProductoFormulario.jsx` 14 | "Producto no encontrado" al editar un id inexistente. | Sin prueba. |
| `PaginaCategorias.jsx` 21 | Título "Categorías" cuando no hay categoría en la URL. | Solo se prueba `/categorias/accesorios`. |
| `PaginaCheckout.jsx` 20 | Mensaje de carrito vacío en el checkout. | Las pruebas del checkout siempre tienen carrito. |
| `PaginaCompraExitosa.jsx` 23 | Texto de entrega "Despacho a …". | Las pruebas compran con retiro en tienda. |
| `PaginaDetalleProducto.jsx` 33 | Clic en "Agregar al carrito" del detalle. | Las pruebas de detalle solo verifican el título. |
| `PaginaLogin.jsx` 24 | Redirección tras un inicio de sesión correcto (RF-19). | Solo se prueban los casos de error. |
| `carrito.js` 12 | Rama de ítems distintos al sumar un producto repetido. | El caso probado tiene un solo ítem. |
| `pago.js` 5 | Rama de número de tarjeta indefinido. | Sin prueba. |
| `validaciones.js` 55 | Mensaje de descuento fuera de rango en `validarProducto`. | Sin prueba. |

## 10.4 Qué mide la cobertura y qué no

La cobertura indica qué código **se ejecutó** durante las pruebas. No demuestra que esté bien verificado ni que no haya errores: una línea puede ejecutarse sin que ningún `expect` compruebe su resultado. Por eso este proyecto no persigue el 100 %, sino cubrir el comportamiento importante y justificar lo que queda fuera. El informe HTML (`coverage/…/index.html`) permite navegar archivo por archivo y ver las líneas rojas, pero no se versiona (está en `.gitignore`).

# 11. Aislamiento de las pruebas: el problema de `localStorage`

## 11.1 Qué pasó, en simple

Todas las pruebas se ejecutan **en la misma página de Chrome**, una detrás de otra. `localStorage` es una "libreta" compartida por toda esa página: lo que una prueba anota, la siguiente puede leerlo. Además, Jasmine las ejecuta **en orden aleatorio**, así que cada corrida las mezcla distinto.

Algunas pruebas dependían de datos que otras habían dejado en la libreta. El problema se identificó en `PaginaCategorias` y, potencialmente, en `PaginaOfertas`, cuyas pruebas esperan contar productos de los **datos semilla** (2 accesorios, 4 ofertas). Un ejemplo del mecanismo, que se deduce del código: la prueba "crea un producto y lo muestra en el panel" (`adminCrud.spec.jsx`) guarda un producto "Gorra negra" de la categoría accesorios. Si la prueba de categorías corriera después sin limpiar, vería 3 accesorios en vez de 2. Si corría antes, pasaba. Resultado: **fallas que dependían del orden**, no del código.

## 11.2 Cómo se resolvió

En el commit `2290d86` ("test: aislar pruebas de categorias y ofertas") se agregó a los `describe` de `PaginaCategorias` y `PaginaOfertas`, en `src/tests/paginasCatalogo.spec.jsx`:

```js
beforeEach(() => {
  window.localStorage.clear();
});
```

- **No se cambiaron las expectativas** de ninguna prueba.
- **No se eliminó ninguna prueba.**
- **No se desactivó el orden aleatorio**: se arregló la causa en lugar de esconder el síntoma.
- El `describe` de `PaginaProductos` de ese archivo ya tenía la limpieza.

## 11.3 Verificación

Después de la corrección, el autor ejecutó **10 veces seguidas** (5 `npm test` y 5 `npm run test:coverage`) en su Mac, y las 10 terminaron en `TOTAL: 93 SUCCESS`. Con orden aleatorio, repetir las ejecuciones es una manera razonable de comprobar estabilidad: si hubiera una dependencia oculta, tarde o temprano un orden desfavorable la mostraría. Diez ejecuciones exitosas aumentan la confianza, pero **no la prueban de forma absoluta**.

## 11.4 Regla que queda

Las pruebas cuyas comprobaciones dependen de los datos guardados limpian `localStorage` en `beforeEach`. `PaginaInicio.spec.jsx` no lo hace porque no depende de ese estado (solo comprueba el título de la portada y la página no usa `localStorage`).

# 12. Pruebas manuales

Las pruebas manuales complementan a las automáticas en lo que Karma no mide.

| Qué se revisó | Cómo | Estado |
|---|---|---|
| Diseño responsivo de 8 vistas (inicio, productos, detalle, carrito, checkout, login, administración y formulario de administración) en 375, 768 y 1280 px | DevTools; 24 capturas en `docs/capturas/` (8 vistas × 3 anchos) | Verificado manualmente (Fase 10) |
| Estabilidad de la suite con orden aleatorio | 10 ejecuciones locales consecutivas | Verificado manualmente |

Checklist de flujos **por registrar** antes de la entrega (hasta ahora no hay evidencia guardada de que se hayan hecho, así que se consideran **planificados**):

| Flujo | Resultado esperado | Estado |
|---|---|---|
| Agregar un producto desde el catálogo y recargar | El carrito y la insignia se conservan | Planificado |
| Compra con tarjeta `4111 1111 1111 1111` y retiro | Compra exitosa con resumen | Planificado |
| Compra con tarjeta `0000 1111 2222 3333` | Compra fallida y carrito intacto | Planificado |
| Compra con despacho | Total con $3.990 y dirección obligatoria | Planificado |
| Inicio de sesión como cliente y como administrador | Cliente a la tienda, administrador al panel | Planificado |
| Crear, editar y eliminar un producto y recargar | Los cambios persisten | Planificado |
| Entrar a `/admin` sin sesión de administrador | Redirección al login | Planificado |

# 13. Análisis

- **Qué demuestran los resultados.** Las 93 pruebas pasan y son estables con orden aleatorio, según las 10 ejecuciones locales. Cubren las cuatro capas y los flujos principales (catálogo, carrito, sesión, checkout y panel).
- **Dónde está el riesgo.** Los huecos de la sección 10.3 se concentran en ramas secundarias y en dos comportamientos relevantes: la **redirección por rol tras el login** (RF-19) y la **conservación del carrito tras un pago rechazado** (RF-29), que están implementados pero sin una prueba que los verifique.
- **Fallas encontradas y corregidas.** El problema de aislamiento de `localStorage` (sección 11).
- **Qué no se puede concluir.** No hay evidencia de funcionamiento en otros navegadores ni sistemas operativos, ni de rendimiento medido.

# 14. Limitaciones e inconsistencias registradas

Lista para revisar en las fases siguientes. **No se modificó la ERS ni se agregaron pruebas en la Fase 13.**

| ID | Hallazgo | Detalle | Acción sugerida (fase posterior) |
|--|-----|------------|-------|
| H-01 | RF-19 sin prueba | El código redirige por rol en `PaginaLogin.jsx` (línea 24), pero ninguna prueba hace un inicio de sesión exitoso. La ERS cita `login.spec.jsx` en la trazabilidad. | Agregar una prueba o ajustar la ERS. |
| H-02 | RF-29 sin prueba de carrito | `PaginaCompraFallida` no vacía el carrito, pero ninguna prueba comprueba que el carrito se conserva tras el pago rechazado. | Agregar una comprobación o ajustar la ERS. |
| H-03 | RNF-10 y RNF-11 | La ERS afirma compatibilidad con "navegadores modernos" y portabilidad a macOS, Windows y Linux, y menciona "instalación en equipos de prueba". La única evidencia es Chrome Headless 156 en macOS. | Reformular lo que se afirma o conseguir evidencia. |
| H-04 | RNF-09 | "Rendimiento: respuestas inmediatas" figura como "verificación manual", sin ninguna medición guardada. | Reformular o eliminar la afirmación. |
| H-05 | RF-20 parcial | El código muestra "Hola, nombre", pero ninguna prueba de la barra comprueba ese texto (se verifican el enlace de administración y el botón de cerrar sesión). | Revisar la trazabilidad. |
| H-06 | RF-23 parcial | Se prueban correo inválido, tarjeta inválida y campos vacíos, pero no un teléfono con formato inválido (por ejemplo, que no comienza con 9). | Revisar la trazabilidad o agregar una prueba. |
| H-07 | RF-36 parcial | El error de descuento fuera de rango de `validarProducto` no está cubierto (`validaciones.js`, línea 55). | Revisar la trazabilidad o agregar una prueba. |
| H-08 | Cifras de cobertura | La ERS cita 95,9 % en líneas y 93 pruebas, valores coherentes con `docs/cobertura.txt`, que se midió antes de `2290d86`. | Mantener la fuente clara al revisar la ERS. |
| H-09 | Referencia a la cobertura | La sección 1.4 de la ERS señala `docs/cobertura.txt` como "Documento de cobertura de testing". Con este documento, la referencia correcta pasa a ser `docs/Documento-Testing`. | Actualizar la ERS. |
| H-10 | Sin salida detallada posterior a `2290d86` | No hay una salida de Karma (lista de pruebas y cobertura) posterior a la corrección. | Recomendado para la revisión final, no bloquea: guardar una salida con `npm run test:coverage 2>&1 \| tee …` y adjuntarla. |
| H-11 | Capturas | Solo hay capturas responsivas de 8 vistas; categorías, ofertas, compra exitosa, compra fallida y 404 no tienen captura. | Decidir si se agregan. |
| H-12 | Importación sin uso | `adminCrud.spec.jsx` importa `actualizarProducto` y no lo usa. No afecta el resultado. | Limpiar si se desea. |
| H-13 | Entregable | El ZIP recibido incluye `node_modules`, `coverage/` y un `fuma-tienda.zip` anidado. | Excluirlos al armar la entrega (Fase 14). |
| H-14 | Frase del Anexo sobre backend | El Anexo menciona "integrado con el backend y frontend", pero los requisitos concretos describen una fuente de datos simulada y la evaluación se centra en el frontend. No se implementó backend. | Consultarlo con el profesor. |

## 14.1 Estado de los hallazgos tras la Fase 14

| Hallazgos | Estado |
|---|---|
| H-01, H-02, H-05, H-06, H-07 | La ERS V2.1 indica ahora "revisión de código" donde no hay prueba automática. No se agregaron pruebas. |
| H-03, H-04 | RNF-09, RNF-10 y RNF-11 reformulados a lo comprobado. |
| H-08, H-09 | Cifras con fuente declarada y referencia a este documento actualizada en la ERS. |
| H-10 | Resuelto para las pruebas: hay salida detallada de la Mac (`salida-karma-mac.txt`). La cobertura posterior a `2290d86` solo se midió en el entorno Linux de la sección 9.3; una salida de `npm run test:coverage` en la Mac es opcional. |
| H-11, H-12 | Pendientes, de baja prioridad. |
| H-13 | Se atiende al armar el ZIP de entrega. |
| H-14 | Pendiente: consultarlo con el profesor. |

# Anexo A. Listado de las 93 pruebas

Generado leyendo los `describe` e `it` de los 17 archivos de `src/tests/` (conteo estático, no una ejecución). Total: 93 pruebas.

### adminCrud.spec.jsx (10 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | TablaProductosAdmin | muestra una fila por producto más el encabezado |
| 2 | TablaProductosAdmin | elimina el producto solo cuando el usuario confirma |
| 3 | TablaProductosAdmin | no elimina el producto cuando el usuario cancela |
| 4 | FormularioProducto | muestra errores y no guarda cuando los datos no son válidos |
| 5 | FormularioProducto | carga los datos del producto al editarlo |
| 6 | FormularioProducto | entrega el precio como número cuando los datos son válidos |
| 7 | RutaAdmin | redirige al login cuando no hay sesión de administrador |
| 8 | RutaAdmin | muestra la página cuando el usuario es administrador |
| 9 | CRUD de productos desde el panel | crea un producto y lo muestra en el panel |
| 10 | CRUD de productos desde el panel | actualiza el precio de un producto existente |

### authContext.spec.jsx (5 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | buscarUsuarioPorCredenciales | devuelve el usuario sin contraseña cuando las credenciales son correctas |
| 2 | buscarUsuarioPorCredenciales | devuelve null cuando la contraseña es incorrecta |
| 3 | AuthProvider | inicia sesión, muestra el usuario y guarda la sesión sin contraseña |
| 4 | AuthProvider | cierra sesión y borra la sesión guardada |
| 5 | AuthProvider | restaura la sesión guardada al iniciar |

### BarraNavegacion.spec.jsx (5 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | BarraNavegacion | muestra la cantidad de ítems del carrito en la insignia |
| 2 | BarraNavegacion | abre y cierra el menú al hacer clic en el botón |
| 3 | BarraNavegacion | incluye enlaces a las secciones principales de la tienda |
| 4 | BarraNavegacion con sesión iniciada | muestra el enlace de administración y el botón para cerrar sesión |
| 5 | BarraNavegacion con sesión iniciada | llama a onCerrarSesion al pulsar Cerrar sesión |

### baseDeDatos.spec.js (6 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | baseDeDatos (CRUD de productos) | carga los datos semilla la primera vez |
| 2 | baseDeDatos (CRUD de productos) | crea un producto con id nuevo y lo persiste |
| 3 | baseDeDatos (CRUD de productos) | actualiza los campos indicados de un producto existente |
| 4 | baseDeDatos (CRUD de productos) | devuelve null al actualizar un producto que no existe |
| 5 | baseDeDatos (CRUD de productos) | elimina un producto existente y reporta el resultado |
| 6 | baseDeDatos (CRUD de productos) | guarda los cambios en localStorage al crear (mock de setItem) |

### carrito.spec.js (5 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | carrito | agrega un producto nuevo con cantidad 1 y precio final |
| 2 | carrito | suma cantidad cuando el producto ya estaba en el carrito |
| 3 | carrito | no modifica el arreglo original al agregar |
| 4 | carrito | elimina el ítem cuando la cantidad cambia a 0 |
| 5 | cambiarCantidad con cantidad positiva | actualiza la cantidad del ítem indicado sin tocar los demás |

### carritoContext.spec.jsx (3 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | CarritoProvider | aumenta el contador al agregar un producto |
| 2 | CarritoProvider | guarda el carrito en localStorage al agregar un producto |
| 3 | CarritoProvider | restaura el carrito guardado al iniciar |

### carritoUI.spec.jsx (10 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | SelectorCantidad | informa cantidad + 1 al pulsar + |
| 2 | SelectorCantidad | deshabilita el botón − cuando la cantidad es 1 |
| 3 | ItemCarrito | muestra el subtotal de la línea (precio por cantidad) |
| 4 | ItemCarrito | llama a onEliminar con el id del producto |
| 5 | ResumenPedido | no muestra total cuando el despacho aún no se conoce |
| 6 | ResumenPedido | muestra el total cuando se informa el costo de envío |
| 7 | PaginaCarrito | muestra un mensaje cuando el carrito está vacío |
| 8 | PaginaCarrito | muestra los productos guardados y los vacía al pulsar Vaciar carrito |
| 9 | botones de cantidad del carrito | informa cantidad - 1 al pulsar − |
| 10 | botones de cantidad del carrito | ItemCarrito pasa el id y la nueva cantidad al pulsar + |

### casosLimite.spec.jsx (7 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | CarritoProvider (acciones secundarias) | quita un producto específico del carrito |
| 2 | CarritoProvider (acciones secundarias) | vacía todo el carrito |
| 3 | CarritoProvider (acciones secundarias) | cambia la cantidad de un producto desde el contexto |
| 4 | FormularioCheckout (elegir despacho) | informa el cambio a despacho al elegir la opción de domicilio |
| 5 | páginas con datos que no existen | muestra 'Producto no encontrado' para un id inexistente |
| 6 | páginas con datos que no existen | muestra 'Pedido no encontrado' para un pedido inexistente |
| 7 | PaginaAdmin (eliminar desde el panel) | elimina el producto de la base de datos cuando el usuario confirma |

### checkout.spec.jsx (7 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | FormularioCheckout | muestra errores y no confirma cuando el formulario está vacío |
| 2 | FormularioCheckout | muestra el campo de dirección solo cuando la entrega es despacho |
| 3 | FormularioCheckout | actualiza el campo nombre al escribir |
| 4 | FormularioCheckout | confirma con los datos cuando todo es válido |
| 5 | PaginaCheckout (flujo de compra) | autocompleta el nombre con el usuario que tiene la sesión iniciada |
| 6 | PaginaCheckout (flujo de compra) | lleva a compra fallida cuando el pago es rechazado |
| 7 | PaginaCheckout (flujo de compra) | crea el pedido, vacía el carrito y muestra la compra exitosa |

### componentesProductos.spec.jsx (7 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | TarjetaProducto | muestra nombre, precio e imagen del producto |
| 2 | TarjetaProducto | llama a onAgregarAlCarrito con el producto al pulsar Agregar |
| 3 | PrecioProducto | muestra un único precio cuando no hay descuento |
| 4 | PrecioProducto | muestra el precio original tachado y el final cuando hay descuento |
| 5 | ListaProductos | renderiza una tarjeta por cada producto |
| 6 | ListaProductos | muestra un mensaje y ninguna tarjeta cuando la lista está vacía |
| 7 | BarraBusqueda | informa el texto escrito por el usuario |

### filtros.spec.js (4 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | filtros de productos | filtra por texto sin distinguir mayúsculas |
| 2 | filtros de productos | devuelve todos los productos cuando el texto está vacío |
| 3 | filtros de productos | filtra por categoría y devuelve todos si no hay categoría |
| 4 | filtros de productos | obtiene solo los productos con descuento |

### login.spec.jsx (6 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | CampoFormulario | muestra el mensaje de error solo cuando hay un error |
| 2 | AlertaMensaje | muestra el mensaje dentro de una alerta |
| 3 | FormularioLogin | actualiza los campos a medida que el usuario escribe |
| 4 | FormularioLogin | entrega el correo y la contraseña al enviar |
| 5 | PaginaLogin | muestra un aviso cuando los campos están vacíos |
| 6 | PaginaLogin | muestra un error con credenciales incorrectas |

### PaginaInicio.spec.jsx (1 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | PaginaInicio | muestra el nombre de la tienda |

### paginasCatalogo.spec.jsx (3 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | PaginaProductos | filtra los productos según el texto buscado |
| 2 | PaginaCategorias | muestra solo los productos de la categoría de la URL |
| 3 | PaginaOfertas | muestra únicamente los productos que tienen descuento |

### precios.spec.js (5 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | precios | calcula el precio con descuento redondeado a pesos enteros |
| 2 | precios | devuelve el mismo precio cuando no hay descuento |
| 3 | precios | suma el despacho solo cuando la entrega es a domicilio |
| 4 | precios | no cobra envío cuando el cliente retira en tienda |
| 5 | precios | formatea montos en pesos chilenos |

### rutas.spec.jsx (2 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | rutas de la aplicación | muestra el producto que corresponde al id de la URL |
| 2 | rutas de la aplicación | muestra la página de no encontrada para una ruta inexistente |

### validaciones.spec.js (7 pruebas)

| # | Grupo (`describe`) | Prueba (`it`) |
|---|---|---|
| 1 | validarDatosCheckout | no devuelve errores cuando los datos son válidos |
| 2 | validarDatosCheckout | rechaza un número de tarjeta que no tiene 16 dígitos |
| 3 | validarDatosCheckout | marca todos los campos vacíos con un error |
| 4 | validarDatosCheckout | rechaza un correo sin formato válido |
| 5 | validarDatosCheckout | exige dirección solo cuando el despacho es a domicilio |
| 6 | pagoEsAprobado | aprueba una tarjeta de 16 dígitos que no empieza con 0000 |
| 7 | pagoEsAprobado | rechaza tarjetas que empiezan con 0000 |
