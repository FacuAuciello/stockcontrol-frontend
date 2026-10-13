
import { useState, type FormEvent } from "react";
import { useInventario } from "../context/useInventario";

function Categorias() {
  const {
    categorias,
    productos,
    crearCategoria,
    editarCategoria,
    eliminarCategoria,
  } = useInventario();

  // Estados del formulario.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [errorFormulario, setErrorFormulario] = useState("");

  // Estado para confirmar una eliminacion.
  const [idEliminando, setIdEliminando] = useState<number | null>(
    null
  );
  const [errorEliminacion, setErrorEliminacion] = useState("");

  const categoriaAEliminar = categorias.find(
    (categoria) => categoria.id === idEliminando
  );

  // Cuenta los productos asociados a una categoria.
  function contarProductos(nombreCategoria: string) {
    return productos.filter(
      (producto) => producto.categoria === nombreCategoria
    ).length;
  }

  // Abre el formulario para crear una categoria.
  function abrirModalNuevo() {
    setIdEditando(null);
    setNombre("");
    setErrorFormulario("");
    setModalAbierto(true);
  }

  // Abre el formulario para editar una categoria.
  function abrirModalEditar(id: number) {
    const categoria = categorias.find(
      (categoria) => categoria.id === id
    );

    if (!categoria) return;

    setIdEditando(categoria.id);
    setNombre(categoria.nombre);
    setErrorFormulario("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setErrorFormulario("");
    setIdEditando(null);
  }

  // Guarda una categoria nueva o edita una existente.
  function guardarCategoria(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const error =
      idEditando === null
        ? crearCategoria(nombre)
        : editarCategoria(idEditando, nombre);

    if (error) {
      setErrorFormulario(error);
      return;
    }

    cerrarModal();
  }

  // Abre la confirmacion de eliminacion.
  function abrirModalEliminar(id: number) {
    setIdEliminando(id);
    setErrorEliminacion("");
  }

  function cancelarEliminacion() {
    setIdEliminando(null);
    setErrorEliminacion("");
  }

  // Intenta eliminar la categoria.
  function confirmarEliminacion() {
    if (idEliminando === null) return;

    const error = eliminarCategoria(idEliminando);

    if (error) {
      setErrorEliminacion(error);
      return;
    }

    cancelarEliminacion();
  }

  return (
    <section className="panel">

      {/* Encabezado */}
      <div className="panel-encabezado">
        <div>
          <h2>Gestion de categorias</h2>
          <p className="descripcion-panel">
            Organiza los productos de tu inventario.
          </p>
        </div>

        <button
          type="button"
          className="boton-principal"
          onClick={abrirModalNuevo}
        >
          + Nueva categoria
        </button>
      </div>

      {/* Listado */}
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Productos asociados</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.nombre}</td>

                <td>
                  {contarProductos(categoria.nombre)}
                </td>

                <td>
                  <div className="acciones-producto">
                    <button
                      type="button"
                      className="boton-editar"
                      onClick={() =>
                        abrirModalEditar(categoria.id)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="boton-eliminar"
                      onClick={() =>
                        abrirModalEliminar(categoria.id)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {categorias.length === 0 && (
              <tr>
                <td colSpan={3} className="tabla-vacia">
                  No hay categorias registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pie-tabla">
        Total: {categorias.length} categorias
      </div>

      {/* Modal para crear o editar */}
      {modalAbierto && (
        <div className="modal-fondo">
          <div
            className="modal-contenido modal-confirmacion"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-categoria"
          >
            <div className="modal-encabezado">
              <div>
                <h2 id="titulo-modal-categoria">
                  {idEditando === null
                    ? "Nueva categoria"
                    : "Editar categoria"}
                </h2>
                <p>Completa los datos de la categoria.</p>
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

            <form onSubmit={guardarCategoria} noValidate>
              <div className="modal-campos">
                <div className="campo-formulario campo-completo">
                  <label htmlFor="nombreCategoria">
                    Nombre de la categoria
                  </label>

                  <input
                    id="nombreCategoria"
                    type="text"
                    placeholder="Ej: Mochilas"
                    value={nombre}
                    onChange={(evento) => {
                      setNombre(evento.target.value);
                      setErrorFormulario("");
                    }}
                  />
                </div>

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
                  {idEditando === null
                    ? "Guardar categoria"
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmacion de eliminacion */}
      {categoriaAEliminar && (
        <div className="modal-fondo">
          <div
            className="modal-contenido modal-confirmacion"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar-categoria"
          >
            <div className="modal-encabezado">
              <div>
                <h2 id="titulo-eliminar-categoria">
                  Eliminar categoria
                </h2>
                <p>Esta accion requiere confirmacion.</p>
              </div>

              <button
                type="button"
                className="boton-cerrar"
                onClick={cancelarEliminacion}
                aria-label="Cerrar confirmacion"
              >
                ×
              </button>
            </div>

            <div className="modal-mensaje">
              <p>
                ¿Estas seguro de que deseas eliminar{" "}
                <strong>{categoriaAEliminar.nombre}</strong>?
              </p>

              <p className="texto-secundario">
                Solo se pueden eliminar categorias sin productos.
              </p>

              {errorEliminacion && (
                <p className="error-formulario" role="alert">
                  {errorEliminacion}
                </p>
              )}
            </div>

            <div className="modal-acciones">
              <button
                type="button"
                className="boton-secundario"
                onClick={cancelarEliminacion}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="boton-confirmar-eliminacion"
                onClick={confirmarEliminacion}
              >
                Eliminar categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Categorias;
