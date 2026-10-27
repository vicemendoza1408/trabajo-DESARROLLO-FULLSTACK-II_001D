// Configuración de Karma: ejecuta las pruebas de src/tests con Jasmine
// en Chrome sin interfaz (headless). Webpack y Babel traducen el JSX.
const path = require("path");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "webpack"],

    // Punto de entrada de las pruebas: un archivo que importa todos los *.spec.jsx.
    files: ["src/tests/index.js"],
    preprocessors: {
      "src/tests/index.js": ["webpack"],
    },

    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: [
                  ["@babel/preset-env", { targets: { chrome: "100" } }],
                  ["@babel/preset-react", { runtime: "automatic" }],
                ],
              },
            },
          },
          {
            test: /\.css$/,
            use: ["style-loader", "css-loader"],
          },
        ],
      },
      resolve: {
        extensions: [".js", ".jsx"],
      },
    },
    webpackMiddleware: { stats: "errors-only" },

    reporters: process.argv.includes("--coverage")
      ? ["spec", "coverage"]
      : ["spec"],
    coverageReporter: {
      dir: path.join(__dirname, "coverage"),
      reporters: [{ type: "html" }, { type: "text-summary" }],
    },

    browsers: ["ChromeHeadlessCI"],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-gpu"],
      },
    },

    specReporter: { suppressPassed: false, suppressSkipped: true },
    singleRun: true,
    autoWatch: false,
    browserNoActivityTimeout: 60000,
  });
};
