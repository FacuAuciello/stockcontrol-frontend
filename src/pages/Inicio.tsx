
import { useInventario } from "../context/useInventario";

function Inicio() {
  // Obtenemos los datos compartidos del inventario.
  const { productos, movimientos } = useInventario();

  // Productos que necesitan reposicion.
  const productosConStockBajo = productos.filter(
    (producto) => producto.stock <= producto.stockMinimo
  );

  // Mostramos solamente los ultimos cinco movimientos.
  const ultimosMovimientos = movimientos.slice(0, 5);

  return (
    <div className="pagina-inicio">

      {/* Productos que necesitan reposicion */}
      <section className="panel">
        <div className="panel-encabezado">
          <h2>Productos para reponer</h2>

          <span className="contador">
            {productosConStockBajo.length} productos
          </span>
        </div>

        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Stock actual</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {productosConStockBajo.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.stock}</td>

                  <td>
                    <span
                      className={
                        producto.stock === 0
                          ? "estado agotado"
                          : "estado bajo"
                      }
                    >
                      {producto.stock === 0
                        ? "Agotado"
                        : "Bajo stock"}
                    </span>
                  </td>
                </tr>
              ))}

              {productosConStockBajo.length === 0 && (
                <tr>
                  <td colSpan={4} className="tabla-vacia">
                    No hay productos que necesiten reposicion.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ultimos movimientos registrados */}
      <section className="panel">
        <div className="panel-encabezado">
          <h2>Ultimos movimientos</h2>
        </div>

        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
              </tr>
            </thead>

            <tbody>
              {ultimosMovimientos.map((movimiento) => (
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
                    {movimiento.tipo === "ENTRADA" ? "+" : "-"}
                    {movimiento.cantidad}
                  </td>
                </tr>
              ))}

              {ultimosMovimientos.length === 0 && (
                <tr>
                  <td colSpan={4} className="tabla-vacia">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

export default Inicio;
