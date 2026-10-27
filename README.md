# Fuma · Tienda de ropa

Tienda online de ropa desarrollada con React, para la Evaluación Parcial 2 de DSY1104 (Desarrollo Fullstack II).

## Tecnologías
- React 18 + Vite
- React Router (navegación)
- Bootstrap 5 (diseño responsivo)
- Jasmine + Karma (pruebas unitarias)
- Datos simulados con localStorage (sin backend)

## Requisitos
- Node.js 18 o superior
- Google Chrome (o Chromium) para las pruebas

## Instalación
```bash
npm install
```

## Ejecución
```bash
npm run dev       # servidor de desarrollo
npm run build     # compilación de producción
npm test          # pruebas unitarias con Karma (Chrome headless)
```

Si Karma no encuentra Chrome, define la variable `CHROME_BIN` con la ruta del ejecutable.

## Estructura
```
src/
├── main.jsx        arranque de la app (estilos + router)
├── App.jsx         tabla de rutas
├── components/     piezas reutilizables
├── pages/          una página por ruta
├── context/        estado global (carrito, sesión)
├── data/           datos simulados y CRUD
├── utils/          lógica pura (precios, carrito, validaciones)
├── styles/         variables y estilos globales
└── tests/          pruebas (*.spec.jsx)
```
