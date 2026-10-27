// Punto de entrada de Karma: carga automáticamente todas las pruebas *.spec.jsx.
const contexto = import.meta.webpackContext(".", {
  recursive: true,
  regExp: /\.spec\.jsx$/,
});
contexto.keys().forEach(contexto);
