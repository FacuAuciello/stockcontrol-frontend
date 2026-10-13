

import { useInventario } from "../context/useInventario";

function Inicio() {
  const { productos, movimientos } = useInventario();

  // Productos agotados o que alcanzaron su minimo.
  const productosParaReponer = productos.filter(
    (producto) => producto.stock <= producto.stockMinimo
  );

  // Priorizamos los agotados y despues los de bajo stock.
  const productosOrdenados = [...productosParaReponer].sort(
    (primero, segundo) => primero.stock - segundo.stock
  );

  // Mostramos los cinco movimientos mas recientes.
  const ultimosMovimientos = movimientos.slice(0, 5);

  return (
    <div className="pagina-inicio">

      {/* Productos que requieren reposicion */}
      <section className="panel">
        <div className="panel-encabezado">
          <div>
            <h2>Productos para reponer</h2>

            <p className="descripcion-panel">
              Productos agotados o con stock igual o inferior
              al minimo configurado.
            </p>
          </div>

          <span className="contador">
            {productosParaReponer.length} productos
          </span>
        </div>

        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Stock actual</th>
                <th>Stock minimo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {productosOrdenados.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td>{producto.stock}</td>
                  <td>{producto.stockMinimo}</td>

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

              {productosOrdenados.length === 0 && (
                <tr>
                  <td colSpan={6} className="tabla-vacia">
                    No hay productos que necesiten reposicion.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historial reciente */}
      <section className="panel">
        <div className="panel-encabezado">
          <div>
            <h2>Ultimos movimientos</h2>

            <p className="descripcion-panel">
              Actividad reciente de entradas y salidas.
            </p>
          </div>
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
