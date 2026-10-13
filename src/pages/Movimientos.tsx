

import { useState, type FormEvent } from "react";

import { useInventario } from "../context/useInventario";
import type { TipoMovimiento } from "../context/inventarioContextDef";


function Movimientos() {
  // Obtenemos los datos y funciones compartidas.
  const { productos, movimientos, registrarMovimiento } =
    useInventario();

  // Filtrado del historial.
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  // Control del formulario modal.
  const [modalAbierto, setModalAbierto] = useState(false);

  // Datos del nuevo movimiento.
  const [idProducto, setIdProducto] = useState("");
  const [tipo, setTipo] = useState<TipoMovimiento>("ENTRADA");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");

  // Mensaje de validacion.
  const [errorFormulario, setErrorFormulario] = useState("");

  // Obtenemos el producto seleccionado en el formulario.
  const productoSeleccionado = productos.find(
    (producto) => producto.id === Number(idProducto)
  );

  // Calculamos el stock resultante antes de guardar.
  const cantidadNumerica = Number(cantidad);

  const stockResultante =
    productoSeleccionado &&
    cantidad.trim() !== "" &&
    Number.isInteger(cantidadNumerica) &&
    cantidadNumerica > 0
      ? tipo === "ENTRADA"
        ? productoSeleccionado.stock + cantidadNumerica
        : productoSeleccionado.stock - cantidadNumerica
      : null;

  // Filtramos el historial por tipo de movimiento.
  const movimientosFiltrados = movimientos.filter(
    (movimiento) =>
      filtroTipo === "Todos" || movimiento.tipo === filtroTipo
  );

  // Abre el formulario y reinicia sus valores.
  function abrirModal() {
    setIdProducto("");
    setTipo("ENTRADA");
    setCantidad("");
    setMotivo("");
    setErrorFormulario("");
    setModalAbierto(true);
  }

  // Cierra el formulario.
  function cerrarModal() {
    setModalAbierto(false);
    setErrorFormulario("");
  }

  // Valida el formulario y registra el movimiento.
  function guardarMovimiento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (
      !idProducto ||
      cantidad.trim() === ""
    ) {
      setErrorFormulario("Selecciona un producto e ingresa la cantidad.");
      return;
    }

    // El contexto valida las reglas del inventario.
    const error = registrarMovimiento({
      idProducto: Number(idProducto),
      tipo,
      cantidad: Number(cantidad),
      motivo,
    });

    if (error) {
      setErrorFormulario(error);
      return;
    }

    // Mostramos todos los movimientos despues de guardar.
    setFiltroTipo("Todos");
    cerrarModal();
  }

  return (
    <section className="panel">

      {/* Encabezado de Movimientos */}
      <div className="panel-encabezado">
        <div>
          <h2>Historial de movimientos</h2>
          <p className="descripcion-panel">
            Consulta las entradas y salidas del inventario.
          </p>
        </div>

        <button
          type="button"
          className="boton-principal"
          onClick={abrirModal}
        >
          + Registrar movimiento
        </button>
      </div>

      {/* Filtros por tipo de movimiento */}
      <div className="filtros-estado filtros-movimientos">
        {[
          { etiqueta: "Todos", valor: "Todos" },
          { etiqueta: "Entradas", valor: "ENTRADA" },
          { etiqueta: "Salidas", valor: "SALIDA" },
        ].map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            className={
              filtroTipo === opcion.valor
                ? "filtro-boton seleccionado"
                : "filtro-boton"
            }
            onClick={() => setFiltroTipo(opcion.valor)}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {/* Tabla de movimientos */}
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th>Stock resultante</th>
            </tr>
          </thead>

          <tbody>
            {movimientosFiltrados.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>{movimiento.fecha}</td>
                <td>{movimiento.producto}</td>

                <td>
                  <span
                    className={
                      movimiento.tipo === "ENTRADA"
                        ? "tipo entrada"
                        : "tipo salida"
                    }
                  >
                    {movimiento.tipo === "ENTRADA"
                      ? "Entrada"
                      : "Salida"}
                  </span>
                </td>

                <td>
                  <span
                    className={
                      movimiento.tipo === "ENTRADA"
                        ? "cantidad-entrada"
                        : "cantidad-salida"
                    }
                  >
                    {movimiento.tipo === "ENTRADA" ? "+" : "-"}
                    {movimiento.cantidad}
                  </span>
                </td>

                <td>{movimiento.motivo || "-"}</td>

                <td>{movimiento.stockResultante ?? "-"}</td>
              </tr>
            ))}

            {movimientosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="tabla-vacia">
                  No se encontraron movimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pie-tabla">
        Mostrando {movimientosFiltrados.length} de{" "}
        {movimientos.length} movimientos
      </div>

      {/* Formulario modal */}
      {modalAbierto && (
        <div className="modal-fondo">
          <div
            className="modal-contenido"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-movimiento"
          >
            <div className="modal-encabezado">
              <div>
                <h2 id="titulo-modal-movimiento">
                  Registrar movimiento
                </h2>
                <p>Completa los datos de la operacion.</p>
              </div>

              <button
                type="button"
                className="boton-cerrar"
                onClick={cerrarModal}
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarMovimiento} noValidate>
              <div className="modal-campos">

                {/* Seleccion del producto */}
                <div className="campo-formulario campo-completo">
                  <label htmlFor="productoMovimiento">
                    Producto
                  </label>

                  <select
                    id="productoMovimiento"
                    value={idProducto}
                    onChange={(evento) => {
                      setIdProducto(evento.target.value);
                      setErrorFormulario("");
                    }}
                  >
                    <option value="">Seleccionar producto...</option>

                    {productos.map((producto) => (
                      <option
                        key={producto.id}
                        value={producto.id}
                      >
                        {producto.nombre} - {producto.codigo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entrada o salida */}
                <div className="campo-formulario campo-completo">
                  <label htmlFor="tipoMovimiento">
                    Tipo de movimiento
                  </label>

                  <select
                    id="tipoMovimiento"
                    value={tipo}
                    onChange={(evento) => {
                      setTipo(
                        evento.target.value as TipoMovimiento
                      );
                      setErrorFormulario("");
                    }}
                  >
                    <option value="ENTRADA">Entrada</option>
                    <option value="SALIDA">Salida</option>
                  </select>
                </div>

                {/* Cantidad de unidades */}
                <div className="campo-formulario campo-completo">
                  <label htmlFor="cantidadMovimiento">
                    Cantidad
                  </label>

                  <input
                    id="cantidadMovimiento"
                    type="number"
                    min="1"
                    step="1"
                    value={cantidad}
                    onChange={(evento) => {
                      setCantidad(evento.target.value);
                      setErrorFormulario("");
                    }}
                  />
                </div>

                {/* Motivo opcional */}
                <div className="campo-formulario campo-completo">
                  <label htmlFor="motivoMovimiento">
                    Motivo (opcional)
                  </label>

                  <input
                    id="motivoMovimiento"
                    type="text"
                    placeholder="Ej: Reposicion de mercaderia"
                    value={motivo}
                    onChange={(evento) =>
                      setMotivo(evento.target.value)
                    }
                  />
                </div>

                {/* Vista previa del stock */}
                {productoSeleccionado && (
                  <div className="resumen-movimiento">
                    <div className="resumen-fila">
                      <span>Stock actual</span>
                      <strong>
                        {productoSeleccionado.stock} unidades
                      </strong>
                    </div>

                    <div className="resumen-fila">
                      <span>Stock resultante</span>
                      <strong>
                        {stockResultante !== null &&
                        stockResultante >= 0
                          ? `${stockResultante} unidades`
                          : "-"}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Errores del formulario */}
                {errorFormulario && (
                  <p className="error-formulario" role="alert">
                    {errorFormulario}
                  </p>
                )}
              </div>

              <div className="modal-acciones">
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="boton-principal"
                >
                  Registrar movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Movimientos;
