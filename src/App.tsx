
import { useState } from "react";

import { InventarioProvider } from "./context/InventarioContext";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import Movimientos from "./pages/Movimientos";

import "./App.css";

// Secciones disponibles en el menu lateral.
const secciones = [
  "Inicio",
  "Productos",
  "Categorias",
  "Movimientos",
  "Alertas",
];

function App() {
  // Guarda la pantalla seleccionada.
  const [seccionActual, setSeccionActual] = useState("Inicio");

  // Determina que pantalla debemos mostrar.
  function mostrarPantalla() {
    switch (seccionActual) {
      case "Inicio":
        return <Inicio />;

      case "Productos":
        return <Productos />;

      case "Movimientos":
        return <Movimientos />;

      default:
        return (
          <section className="contenido-seccion">
            <h2>{seccionActual}</h2>
            <p>Estamos construyendo esta seccion.</p>
          </section>
        );
    }
  }

  return (
    <InventarioProvider>
      <div className="aplicacion">

        {/* Menu lateral */}
        <aside className="menu-lateral">
          <h2 className="nombre-sistema">
            StockControl
          </h2>

          <nav className="navegacion">
            {secciones.map((seccion) => (
              <button
                key={seccion}
                type="button"
                className={
                  seccionActual === seccion
                    ? "boton-menu activo"
                    : "boton-menu"
                }
                onClick={() => setSeccionActual(seccion)}
              >
                {seccion}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido de la pantalla seleccionada */}
        <main className="contenido-principal">
          <header className="encabezado">
            <h1>{seccionActual}</h1>
            <p>Sistema de gestion de productos y stock</p>
          </header>

          {mostrarPantalla()}
        </main>

      </div>
    </InventarioProvider>
  );
}

export default App;
