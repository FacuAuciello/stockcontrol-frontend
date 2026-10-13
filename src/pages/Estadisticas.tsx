
import {
  Package,
  Tags,
  AlertTriangle,
  PackageX,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

import { useInventario } from "../context/useInventario";

function Estadisticas() {
  const { productos, categorias, movimientos } = useInventario();

  // Indicadores del inventario.
  const totalProductos = productos.length;
  const totalCategorias = categorias.length;

  const productosBajoStock = productos.filter(
    (producto) =>
      producto.stock > 0 &&
      producto.stock <= producto.stockMinimo
  ).length;

  const productosAgotados = productos.filter(
    (producto) => producto.stock === 0
  ).length;

  const totalMovimientos = movimientos.length;

  const totalEntradas = movimientos.filter(
    (movimiento) => movimiento.tipo === "ENTRADA"
  ).length;

  const totalSalidas = movimientos.filter(
    (movimiento) => movimiento.tipo === "SALIDA"
  ).length;

  return (
    <div className="pagina-estadisticas">

      {/* Indicadores principales */}
      <div className="estadisticas-cuadricula">

        <article className="tarjeta-estadistica">
          <div className="estadistica-icono icono-productos">
            <Package size={21} />
          </div>
          <span className="estadistica-etiqueta">
            Productos registrados
          </span>
          <strong className="estadistica-numero">
            {totalProductos}
          </strong>
          <span className="estadistica-detalle">
            Productos en el catalogo
          </span>
        </article>

        <article className="tarjeta-estadistica">
          <div className="estadistica-icono icono-categorias">
            <Tags size={21} />
          </div>
          <span className="estadistica-etiqueta">
            Categorias
          </span>
          <strong className="estadistica-numero">
            {totalCategorias}
          </strong>
          <span className="estadistica-detalle">
            Categorias disponibles
          </span>
        </article>

        <article className="tarjeta-estadistica">
          <div className="estadistica-icono icono-alerta">
            <AlertTriangle size={21} />
          </div>
          <span className="estadistica-etiqueta">
            Productos con bajo stock
          </span>
          <strong className="estadistica-numero">
            {productosBajoStock}
          </strong>
          <span className="estadistica-detalle">
            Necesitan reposicion
          </span>
        </article>

        <article className="tarjeta-estadistica">
          <div className="estadistica-icono icono-agotados">
            <PackageX size={21} />
          </div>
          <span className="estadistica-etiqueta">
            Productos agotados
          </span>
          <strong className="estadistica-numero">
            {productosAgotados}
          </strong>
          <span className="estadistica-detalle">
            Sin unidades disponibles
          </span>
        </article>

      </div>

      {/* Resumen de los movimientos */}
      <section className="panel">
        <div className="panel-encabezado">
          <div>
            <h2>Resumen de movimientos</h2>
            <p className="descripcion-panel">
              Operaciones registradas en el inventario.
            </p>
          </div>
        </div>

        <div className="resumen-estadisticas">

          <div className="resumen-estadistica-item">
            <ArrowLeftRight size={20} />
            <span>Total de movimientos</span>
            <strong>{totalMovimientos}</strong>
          </div>

          <div className="resumen-estadistica-item">
            <ArrowDownToLine size={20} />
            <span>Entradas registradas</span>
            <strong>{totalEntradas}</strong>
          </div>

          <div className="resumen-estadistica-item">
            <ArrowUpFromLine size={20} />
            <span>Salidas registradas</span>
            <strong>{totalSalidas}</strong>
          </div>

        </div>
      </section>

      <p className="nota-estadisticas">
        Los indicadores se actualizan automaticamente al modificar
        productos, categorias o registrar movimientos.
      </p>

    </div>
  );
}

export default Estadisticas;
