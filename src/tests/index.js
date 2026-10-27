// Punto de entrada de Karma: carga automáticamente todas las pruebas *.spec.js(x).
const contexto = import.meta.webpackContext(".", {
  recursive: true,
  regExp: /\.spec\.jsx?$/,
});
contexto.keys().forEach(contexto);
