import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/variables.css";
import "./styles/global.css";
import { CarritoProvider } from "./context/CarritoContext.jsx";
import App from "./App.jsx";

// Punto de entrada: el router y el carrito envuelven toda la aplicación.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CarritoProvider>
        <App />
      </CarritoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
