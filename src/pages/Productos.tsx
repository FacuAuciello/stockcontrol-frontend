
import { useState, type FormEvent } from "react";
import { useInventario } from "../context/useInventario";

// Campos que utilizaremos en el formulario.
const formularioInicial = {
  codigo: "",
  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  stockMinimo: "",
};

function Productos() {
   // Obtenemos los productos y la funcion para modificarlos
  // desde el contexto compartido de React.
  const { productos, setProductos, categorias } = useInventario();

  // Estados de busqueda y filtros.
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

  // Estados del formulario de alta y edicion.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [errorFormulario, setErrorFormulario] = useState("");

  // Si es null creamos; si tiene un ID editamos.
  const [idProductoEditando, setIdProductoEditando] =
    useState<number | null>(null);

  // Guarda el ID del producto pendiente de eliminacion.
  const [idProductoEliminando, setIdProductoEliminando] =
    useState<number | null>(null);

  // Obtenemos el producto que se quiere eliminar.
  const productoAEliminar = productos.find(
    (producto) => producto.id === idProductoEliminando
  );

  // Aplicamos los filtros a la lista de productos.
  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria =
      filtroCategoria === "Todas" ||
      producto.categoria === filtroCategoria;

    const coincideEstado =
      filtroEstado === "Todos" ||
      (filtroEstado === "Disponible" &&
        producto.stock > producto.stockMinimo) ||
      (filtroEstado === "Bajo stock" &&
        producto.stock > 0 &&
        producto.stock <= producto.stockMinimo) ||
      (filtroEstado === "Agotados" && producto.stock === 0);

    return coincideBusqueda && coincideCategoria && coincideEstado;
  });

  // Abre el modal para agregar un producto.
  function abrirModalNuevo() {
    setIdProductoEditando(null);
    setFormulario(formularioInicial);
    setErrorFormulario("");
    setModalAbierto(true);
  }

  // Abre el modal para editar un producto.
  function abrirModalEditar(id: number) {
    const producto = productos.find((producto) => producto.id === id);

    if (!producto) return;

    setIdProductoEditando(id);

    setFormulario({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: String(producto.precio),
      stock: String(producto.stock),
      stockMinimo: String(producto.stockMinimo),
    });

    setErrorFormulario("");
    setModalAbierto(true);
  }

  // Cierra el formulario de alta o edicion.
  function cerrarModal() {
    setModalAbierto(false);
    setIdProductoEditando(null);
    setErrorFormulario("");
  }

  // Actualiza un campo del formulario.
  function actualizarCampo(
    campo: keyof typeof formularioInicial,
    valor: string
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  // Crea o actualiza un producto.
  function guardarProducto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const codigo = formulario.codigo.trim().toUpperCase();
    const nombre = formulario.nombre.trim();

    // Validamos los campos obligatorios.
    if (
      !codigo ||
      !nombre ||
      !formulario.categoria ||
      formulario.precio.trim() === "" ||
      formulario.stockMinimo.trim() === "" ||
      (idProductoEditando === null && formulario.stock.trim() === "")
    ) {
      setErrorFormulario("Completa todos los campos.");
      return;
    }

    // No permitimos codigos duplicados entre productos distintos.
    const codigoExistente = productos.some(
      (producto) =>
        producto.codigo.toUpperCase() === codigo &&
        producto.id !== idProductoEditando
    );

    if (codigoExistente) {
      setErrorFormulario("Ya existe otro producto con ese codigo.");
      return;
    }

    // Convertimos los valores del formulario a numeros.
    const precio = Number(formulario.precio);
    const stock = Number(formulario.stock);
    const stockMinimo = Number(formulario.stockMinimo);

    // Validamos precio y cantidades.
    if (
      !Number.isFinite(precio) ||
      !Number.isInteger(stock) ||
      !Number.isInteger(stockMinimo) ||
      precio <= 0 ||
      stock < 0 ||
      stockMinimo < 0
    ) {
      setErrorFormulario("Verifica el precio y las cantidades ingresadas.");
      return;
    }

    if (idProductoEditando !== null) {
      // Actualizamos el producto conservando su stock actual.
      setProductos((anteriores) =>
        anteriores.map((producto) =>
          producto.id === idProductoEditando
            ? {
                ...producto,
                codigo,
                nombre,
                categoria: formulario.categoria,
                precio,
                stockMinimo,
              }
            : producto
        )
      );
    } else {
      // Generamos un ID para el producto nuevo.
      const nuevoId =
        Math.max(0, ...productos.map((producto) => producto.id)) + 1;

      const nuevoProducto = {
        id: nuevoId,
        codigo,
        nombre,
        categoria: formulario.categoria,
        precio,
        stock,
        stockMinimo,
      };

      setProductos((anteriores) => [...anteriores, nuevoProducto]);
    }

    // Reiniciamos los filtros para mostrar todos los productos.
    setBusqueda("");
    setFiltroCategoria("Todas");
    setFiltroEstado("Todos");

    cerrarModal();
  }

  // Abre la confirmacion para eliminar un producto.
  function abrirModalEliminar(id: number) {
    setIdProductoEliminando(id);
  }

  // Cancela la eliminacion sin modificar el inventario.
  function cancelarEliminacion() {
    setIdProductoEliminando(null);
  }

  // Elimina el producto seleccionado del estado.
  function confirmarEliminacion() {
    if (idProductoEliminando === null) return;

    setProductos((anteriores) =>
      anteriores.filter(
        (producto) => producto.id !== idProductoEliminando
      )
    );

    // Cerramos la ventana de confirmacion.
    setIdProductoEliminando(null);
  }

  return (
    <section className="panel">

      {/* Encabezado principal */}
      <div className="panel-encabezado">
        <div>
          <h2>Listado de productos</h2>
          <p className="descripcion-panel">
            Consulta y administra los productos de tu inventario.
          </p>
        </div>

        <button
          type="button"
          className="boton-principal"
          onClick={abrirModalNuevo}
        >
          + Nuevo producto
        </button>
      </div>

      {/* Buscador y categorias */}
      <div className="barra-herramientas">
        <input
          type="search"
          className="campo-busqueda"
          placeholder="Buscar por nombre o codigo..."
          aria-label="Buscar productos"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />

        <select
          className="selector"
          aria-label="Filtrar por categoria"
          value={filtroCategoria}
          onChange={(evento) =>
            setFiltroCategoria(evento.target.value)
          }
        >
          <option value="Todas">Todas las categorias</option>

          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.nombre}>
            {categoria.nombre}
            </option>
          ))}

        </select>
      </div>

      {/* Filtros por estado */}
      <div className="filtros-estado">
        {["Todos", "Disponible", "Bajo stock", "Agotados"].map(
          (estado) => (
            <button
              key={estado}
              type="button"
              className={
                filtroEstado === estado
                  ? "filtro-boton seleccionado"
                  : "filtro-boton"
              }
              onClick={() => setFiltroEstado(estado)}
            >
              {estado}
            </button>
          )
        )}
      </div>

      {/* Tabla de productos */}
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Minimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productosFiltrados.map((producto) => {
              const estado =
                producto.stock === 0
                  ? "Agotado"
                  : producto.stock <= producto.stockMinimo
                    ? "Bajo stock"
                    : "Disponible";

              return (
                <tr key={producto.id}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>

                  <td>
                    {producto.precio.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      maximumFractionDigits: 0,
                    })}
                  </td>

                  <td>{producto.stock}</td>
                  <td>{producto.stockMinimo}</td>

                  <td>
                    <span
                      className={
                        estado === "Agotado"
                          ? "estado agotado"
                          : estado === "Bajo stock"
                            ? "estado bajo"
                            : "estado disponible"
                      }
                    >
                      {estado}
                    </span>
                  </td>

                  {/* Acciones del producto */}
                  <td>
                    <div className="acciones-producto">
                      <button
                        type="button"
                        className="boton-editar"
                        onClick={() => abrirModalEditar(producto.id)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="boton-eliminar"
                        onClick={() => abrirModalEliminar(producto.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan={8} className="tabla-vacia">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pie-tabla">
        Mostrando {productosFiltrados.length} de {productos.length} productos
      </div>

      {/* Modal para crear o editar productos */}
      {modalAbierto && (
        <div className="modal-fondo">
          <div
            className="modal-contenido"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-producto"
          >
            <div className="modal-encabezado">
              <div>
                <h2 id="titulo-modal-producto">
                  {idProductoEditando === null
                    ? "Nuevo producto"
                    : "Editar producto"}
                </h2>
                <p>Completa los datos del producto.</p>
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

            <form onSubmit={guardarProducto} noValidate>
              <div className="modal-campos">

                <div className="campo-formulario campo-completo">
                  <label htmlFor="nombre">Nombre del producto</label>
                  <input
                    id="nombre"
                    type="text"
                    value={formulario.nombre}
                    onChange={(evento) =>
                      actualizarCampo("nombre", evento.target.value)
                    }
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="codigo">Codigo</label>
                  <input
                    id="codigo"
                    type="text"
                    value={formulario.codigo}
                    onChange={(evento) =>
                      actualizarCampo("codigo", evento.target.value)
                    }
                  />
                </div>

                <div className="campo-formulario">
                  <label htmlFor="categoria">Categoria</label>
                  <select
                    id="categoria"
                    value={formulario.categoria}
                    onChange={(evento) =>
                      actualizarCampo("categoria", evento.target.value)
                    }
                  >
                    <option value="">Seleccionar...</option>

                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.nombre}>
                        {categoria.nombre}
                      </option>
                    ))}

                  </select>
                </div>

                <div className="campo-formulario">
                  <label htmlFor="precio">Precio ($)</label>
                  <input
                    id="precio"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formulario.precio}
                    onChange={(evento) =>
                      actualizarCampo("precio", evento.target.value)
                    }
                  />
                </div>

                {/* Stock inicial solo al crear un producto */}
                {idProductoEditando === null ? (
                  <div className="campo-formulario">
                    <label htmlFor="stock">Stock inicial</label>
                    <input
                      id="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={formulario.stock}
                      onChange={(evento) =>
                        actualizarCampo("stock", evento.target.value)
                      }
                    />
                  </div>
                ) : (
                  <div className="campo-formulario">
                    <label>Stock actual</label>
                    <div className="campo-solo-lectura">
                      {formulario.stock} unidades
                    </div>
                  </div>
                )}

                <div className="campo-formulario campo-completo">
                  <label htmlFor="stockMinimo">Stock minimo</label>
                  <input
                    id="stockMinimo"
                    type="number"
                    min="0"
                    step="1"
                    value={formulario.stockMinimo}
                    onChange={(evento) =>
                      actualizarCampo("stockMinimo", evento.target.value)
                    }
                    aria-describedby="ayuda-stock-minimo"
                  />

                    <small id="ayuda-stock-minimo" className="texto-ayuda">
                    Cantidad minima para mostrar una alerta de reposicion.
                    </small>
                </div>

                {idProductoEditando !== null && (
                  <p className="mensaje-stock">
                    Para cambiar el stock utiliza la seccion Movimientos.
                  </p>
                )}

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

                <button type="submit" className="boton-principal">
                  {idProductoEditando === null
                    ? "Guardar producto"
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmacion de eliminacion */}
      {productoAEliminar && (
        <div className="modal-fondo">
          <div
            className="modal-contenido modal-confirmacion"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminacion"
          >
            <div className="modal-encabezado">
              <div>
                <h2 id="titulo-eliminacion">Eliminar producto</h2>
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
                ¿Estas seguro de que deseas eliminar
                <strong> {productoAEliminar.nombre}</strong>?
              </p>
              <p className="texto-secundario">
                El producto sera quitado del inventario de la demo.
              </p>
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
                Eliminar producto
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Productos;
