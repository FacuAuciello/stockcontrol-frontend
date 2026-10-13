
import { useState } from "react";

import {
  LayoutDashboard,
  Package,
  Tags,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Truck,
  FileText,
  FileSpreadsheet,
  Sun,
  Moon,
  ChevronDown,
  LockKeyhole,
} from "lucide-react";

import { InventarioProvider } from "./context/InventarioContext";

import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Movimientos from "./pages/Movimientos";
import Estadisticas from "./pages/Estadisticas";
import ExcelCSV from "./pages/ExcelCSV";

import "./App.css";

// Secciones principales del sistema.
const secciones = [
  {
    nombre: "Inicio",
    icono: LayoutDashboard,
    descripcion: "Resumen general del inventario",
  },
  {
    nombre: "Productos",
    icono: Package,
    descripcion: "Consulta y administra tu catalogo",
  },
  {
    nombre: "Categorias",
    icono: Tags,
    descripcion: "Organiza los productos por categoria",
  },
  {
    nombre: "Movimientos",
    icono: ArrowLeftRight,
    descripcion: "Registra entradas y salidas de mercaderia",
  },
  {
    nombre: "Estadisticas",
    icono: ChartNoAxesCombined,
    descripcion: "Indicadores generales del inventario",
  },
];

// Herramientas disponibles.
const seccionesHerramientas = [
  {
    nombre: "Excel / CSV",
    icono: FileSpreadsheet,
    descripcion: "Importa y exporta productos de tu inventario",
  },
];

// Funcionalidades futuras.
const seccionesFuturas = [
  {
    nombre: "Proveedores",
    icono: Truck,
  },
  {
    nombre: "Reportes",
    icono: FileText,
  },
];

function App() {
  // Pantalla seleccionada.
  const [seccionActual, setSeccionActual] = useState("Inicio");

  // Recuperamos la preferencia del tema.
  const [temaOscuro, setTemaOscuro] = useState<boolean>(() => {
    return localStorage.getItem("stockcontrol-tema") === "oscuro";
  });

  // Buscamos la descripcion de la pantalla seleccionada.
  const todasLasSecciones = [
    ...secciones,
    ...seccionesHerramientas,
  ];

  const seccionSeleccionada = todasLasSecciones.find(
    (seccion) => seccion.nombre === seccionActual
  );

  // Cambia el modo claro u oscuro.
  function cambiarTema() {
    const nuevoTema = !temaOscuro;

    setTemaOscuro(nuevoTema);

    localStorage.setItem(
      "stockcontrol-tema",
      nuevoTema ? "oscuro" : "claro"
    );
  }

  // Selecciona la pantalla que corresponde mostrar.
  function mostrarPantalla() {
    switch (seccionActual) {
      case "Inicio":
        return <Inicio />;

      case "Productos":
        return <Productos />;

      case "Categorias":
        return <Categorias />;

      case "Movimientos":
        return <Movimientos />;

      case "Estadisticas":
        return <Estadisticas />;

      case "Excel / CSV":
        return <ExcelCSV />;

      default:
        return <Inicio />;
    }
  }

  return (
    <InventarioProvider>
      <div
        className="aplicacion"
        data-theme={temaOscuro ? "oscuro" : "claro"}
      >

        {/* Menu lateral */}
        <aside className="menu-lateral">

          {/* Nombre del sistema */}
          <div className="marca-sistema">
            <div className="marca-icono">
              <Package size={21} strokeWidth={2} />
            </div>

            <div>
              <h2 className="nombre-sistema">
                StockControl
              </h2>

              <span className="marca-descripcion">
                Gestion de inventario
              </span>
            </div>
          </div>

          {/* Secciones principales */}
          <div className="seccion-menu-titulo">
            PRINCIPAL
          </div>

          <nav
            className="navegacion"
            aria-label="Menu principal"
          >
            {secciones.map((seccion) => {
              const Icono = seccion.icono;

              return (
                <button
                  key={seccion.nombre}
                  type="button"
                  className={
                    seccionActual === seccion.nombre
                      ? "boton-menu activo"
                      : "boton-menu"
                  }
                  onClick={() =>
                    setSeccionActual(seccion.nombre)
                  }
                >
                  <Icono size={18} strokeWidth={1.9} />
                  <span>{seccion.nombre}</span>
                </button>
              );
            })}
          </nav>

          {/* Herramientas */}
          <div className="seccion-menu-titulo titulo-herramientas">
            HERRAMIENTAS
          </div>

          <nav
            className="navegacion"
            aria-label="Herramientas"
          >
            {seccionesHerramientas.map((seccion) => {
              const Icono = seccion.icono;

              return (
                <button
                  key={seccion.nombre}
                  type="button"
                  className={
                    seccionActual === seccion.nombre
                      ? "boton-menu activo"
                      : "boton-menu"
                  }
                  onClick={() =>
                    setSeccionActual(seccion.nombre)
                  }
                >
                  <Icono size={18} strokeWidth={1.9} />
                  <span>{seccion.nombre}</span>
                </button>
              );
            })}
          </nav>

          {/* Funcionalidades futuras */}
          <div className="seccion-menu-titulo titulo-futuro">
            PROXIMAMENTE
          </div>

          <div className="navegacion">
            {seccionesFuturas.map((seccion) => {
              const Icono = seccion.icono;

              return (
                <div
                  key={seccion.nombre}
                  className="boton-menu menu-deshabilitado"
                  title="Funcionalidad en desarrollo"
                >
                  <Icono size={18} strokeWidth={1.9} />

                  <span>{seccion.nombre}</span>

                  <LockKeyhole
                    size={13}
                    className="icono-bloqueo"
                  />
                </div>
              );
            })}
          </div>

          {/* Pie del menu */}
          <div className="menu-pie">
            <span className="indicador-demo" />
            Version demostrativa
          </div>

        </aside>

        {/* Area principal */}
        <div className="area-trabajo">

          {/* Barra superior */}
          <div className="barra-superior">

            {/* Nombre del negocio */}
            <div className="identidad-negocio">
              <div className="avatar-negocio">
                LC
              </div>

              <div className="negocio-datos">
                <strong>Libreria Central</strong>
                <span>Inventario general</span>
              </div>

              <ChevronDown
                size={15}
                className="flecha-negocio"
              />
            </div>

            {/* Acciones superiores */}
            <div className="barra-acciones">

              <span className="etiqueta-demo">
                Demo
              </span>

              <span className="etiqueta-plan">
                Plan Base
              </span>

              {/* Boton claro / oscuro */}
              <button
                type="button"
                className="boton-tema"
                onClick={cambiarTema}
                title={
                  temaOscuro
                    ? "Activar modo claro"
                    : "Activar modo oscuro"
                }
                aria-label={
                  temaOscuro
                    ? "Activar modo claro"
                    : "Activar modo oscuro"
                }
              >
                {temaOscuro ? (
                  <Sun size={19} />
                ) : (
                  <Moon size={19} />
                )}
              </button>

              {/* Usuario ficticio */}
              <div
                className="avatar-usuario"
                title="Usuario de demostracion"
              >
                AD
              </div>

            </div>
          </div>

          {/* Pantalla seleccionada */}
          <main className="contenido-principal">

            <header className="encabezado">
              <h1>{seccionActual}</h1>

              <p>
                {seccionSeleccionada?.descripcion}
              </p>
            </header>

            {mostrarPantalla()}

          </main>
        </div>
      </div>
    </InventarioProvider>
  );
}

export default App;
