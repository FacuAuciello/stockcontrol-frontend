

import { useState, type ChangeEvent } from "react";
import { readSheet } from "read-excel-file/browser";

import {
  Download,
  Upload,
  FileSpreadsheet,
  FileDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useInventario } from "../context/useInventario";
import type { Producto } from "../context/inventarioContextDef";

// Campos disponibles para la importacion.
type CampoImportacion =
  | "codigo"
  | "nombre"
  | "categoria"
  | "precio"
  | "stock"
  | "stockMinimo";

type AsociacionColumnas = Record<number, CampoImportacion | "">;

const campos: { valor: CampoImportacion; nombre: string }[] = [
  { valor: "codigo", nombre: "Codigo" },
  { valor: "nombre", nombre: "Nombre" },
  { valor: "categoria", nombre: "Categoria" },
  { valor: "precio", nombre: "Precio" },
  { valor: "stock", nombre: "Stock actual" },
  { valor: "stockMinimo", nombre: "Stock minimo" },
];

const encabezados = campos.map((campo) => campo.valor);

// Normaliza nombres de columnas para poder compararlos.
function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Reconoce nombres habituales de columnas de Excel.
function sugerirCampo(titulo: string): CampoImportacion | "" {
  const equivalencias: Record<string, CampoImportacion> = {
    codigo: "codigo",
    cod: "codigo",
    sku: "codigo",
    nombre: "nombre",
    producto: "nombre",
    articulo: "nombre",
    descripcion: "nombre",
    categoria: "categoria",
    rubro: "categoria",
    tipo: "categoria",
    precio: "precio",
    precioventa: "precio",
    preciounitario: "precio",
    stock: "stock",
    stockactual: "stock",
    cantidad: "stock",
    cant: "stock",
    unidades: "stock",
    existencia: "stock",
    existencias: "stock",
    stockminimo: "stockMinimo",
    minimo: "stockMinimo",
    puntoreposicion: "stockMinimo",
  };

  return equivalencias[normalizarTexto(titulo)] ?? "";
}

// Lee archivos CSV separados por coma o punto y coma.
function leerCSV(contenido: string): string[][] {
  const texto = contenido.replace(/^\uFEFF/, "");

  const primeraLinea = texto.split(/\r?\n/, 1)[0] ?? "";
  const separador = primeraLinea.includes(";") ? ";" : ",";

  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let dentroComillas = false;

  for (let indice = 0; indice < texto.length; indice++) {
    const caracter = texto[indice];
    const siguiente = texto[indice + 1];

    if (caracter === '"') {
      if (dentroComillas && siguiente === '"') {
        campo += '"';
        indice++;
      } else {
        dentroComillas = !dentroComillas;
      }
    } else if (caracter === separador && !dentroComillas) {
      fila.push(campo.trim());
      campo = "";
    } else if (
      (caracter === "\n" || caracter === "\r") &&
      !dentroComillas
    ) {
      if (caracter === "\r" && siguiente === "\n") {
        indice++;
      }

      fila.push(campo.trim());

      if (fila.some((valor) => valor !== "")) {
        filas.push(fila);
      }

      fila = [];
      campo = "";
    } else {
      campo += caracter;
    }
  }

  if (dentroComillas) {
    throw new Error("El archivo contiene comillas sin cerrar.");
  }

  fila.push(campo.trim());

  if (fila.some((valor) => valor !== "")) {
    filas.push(fila);
  }

  return filas;
}

// Descarga un archivo CSV que se puede abrir con Excel.
function descargarCSV(
  nombreArchivo: string,
  filas: string[][]
): void {
  const contenido = filas
    .map((fila) =>
      fila
        .map((valor) => `"${valor.replace(/"/g, '""')}"`)
        .join(";")
    )
    .join("\r\n");

  const archivo = new Blob(["\uFEFF", contenido], {
    type: "text/csv;charset=utf-8;",
  });

  const direccion = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");

  enlace.href = direccion;
  enlace.download = nombreArchivo;

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  URL.revokeObjectURL(direccion);
}

// Convierte precios escritos en diferentes formatos.
function convertirPrecio(valor: string): number {
  const limpio = valor
    .trim()
    .replace(/\s/g, "")
    .replace(/\$/g, "");

  if (limpio.includes(",") && limpio.includes(".")) {
    if (limpio.lastIndexOf(",") > limpio.lastIndexOf(".")) {
      return Number(
        limpio.replace(/\./g, "").replace(",", ".")
      );
    }

    return Number(limpio.replace(/,/g, ""));
  }

  if (limpio.includes(",")) {
    return Number(limpio.replace(",", "."));
  }

  return Number(limpio);
}

// Genera un codigo unico para productos sin codigo.
function generarCodigo(
  codigos: Set<string>,
  contador: number
): string {
  let numero = contador;
  let codigo: string;

  do {
    codigo = `IMP-${String(numero).padStart(5, "0")}`;
    numero++;
  } while (codigos.has(codigo));

  return codigo;
}

function ExcelCSV() {
  const { productos, setProductos, categorias } = useInventario();

  // Archivo seleccionado.
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [filasArchivo, setFilasArchivo] = useState<string[][]>([]);

  // Relacion entre columnas del archivo y campos del sistema.
  const [asociaciones, setAsociaciones] =
    useState<AsociacionColumnas>({});

  // Stock minimo utilizado cuando el archivo no lo indica.
  const [minimoPredeterminado, setMinimoPredeterminado] =
    useState("10");

  // Mensajes al usuario.
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const columnas = filasArchivo[0] ?? [];
  const filasProductos = filasArchivo.slice(1);

  // Modifica una asociacion de columna.
  function cambiarAsociacion(
    indice: number,
    campo: CampoImportacion | ""
  ): void {
    setAsociaciones((anteriores) => ({
      ...anteriores,
      [indice]: campo,
    }));

    setError("");
  }

  // Descarga el ejemplo de la plantilla.
  function descargarPlantilla(): void {
    const filas = [
      encabezados,
      [
        "LIB-100",
        "Cuaderno tapa dura",
        "Cuadernos",
        "5500",
        "25",
        "10",
      ],
    ];

    descargarCSV("stockcontrol-plantilla.csv", filas);

    setError("");
    setMensaje("Plantilla descargada correctamente.");
  }

  // Exporta todos los productos actuales.
  function exportarInventario(): void {
    const filas = [
      encabezados,
      ...productos.map((producto) => [
        producto.codigo,
        producto.nombre,
        producto.categoria,
        String(producto.precio),
        String(producto.stock),
        String(producto.stockMinimo),
      ]),
    ];

    descargarCSV("stockcontrol-inventario.csv", filas);

    setError("");
    setMensaje("Inventario exportado correctamente.");
  }

  // Lee el Excel o CSV que selecciono el usuario.
  async function seleccionarArchivo(
    evento: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    setError("");
    setMensaje("");
    setFilasArchivo([]);
    setAsociaciones({});
    setNombreArchivo("");

    try {
      const extension = archivo.name
        .split(".")
        .pop()
        ?.toLowerCase();

      let filas: string[][] = [];

      if (extension === "xlsx") {
        // readSheet devuelve directamente las filas del Excel.
        const datosExcel = await readSheet(archivo);

        filas = datosExcel.map((fila) =>
          fila.map((celda) => String(celda ?? ""))
        );
      } else if (extension === "csv") {
        filas = leerCSV(await archivo.text());
      } else {
        throw new Error(
          "Selecciona un archivo Excel .xlsx o CSV .csv."
        );
      }

      // Quitamos las filas completamente vacias.
      filas = filas.filter((fila) =>
        fila.some((valor) => valor.trim() !== "")
      );

      if (filas.length < 2) {
        throw new Error(
          "El archivo debe contener encabezados y al menos un producto."
        );
      }

      // Intentamos reconocer automaticamente las columnas.
      const sugerencias: AsociacionColumnas = {};
      const utilizados = new Set<string>();

      filas[0].forEach((titulo, indice) => {
        const sugerencia = sugerirCampo(titulo);

        if (
          sugerencia !== "" &&
          !utilizados.has(sugerencia)
        ) {
          sugerencias[indice] = sugerencia;
          utilizados.add(sugerencia);
        } else {
          sugerencias[indice] = "";
        }
      });

      setNombreArchivo(archivo.name);
      setFilasArchivo(filas);
      setAsociaciones(sugerencias);
    } catch (errorCapturado) {
      setError(
        errorCapturado instanceof Error
          ? errorCapturado.message
          : "No se pudo leer el archivo."
      );
    } finally {
      evento.target.value = "";
    }
  }

  // Busca el valor correspondiente a un campo.
  function obtenerValor(
    fila: string[],
    campo: CampoImportacion
  ): string {
    const indice = Object.keys(asociaciones).find(
      (clave) => asociaciones[Number(clave)] === campo
    );

    if (indice === undefined) {
      return "";
    }

    return fila[Number(indice)]?.trim() ?? "";
  }

  // Valida el archivo y registra todos los productos.
  function confirmarImportacion(): void {
    setError("");
    setMensaje("");

    if (filasProductos.length === 0) {
      setError("Primero selecciona un archivo.");
      return;
    }

    const valoresAsociados = Object.values(asociaciones).filter(
      (valor): valor is CampoImportacion => valor !== ""
    );

    // Evitamos asociar dos columnas al mismo campo.
    if (
      new Set(valoresAsociados).size !==
      valoresAsociados.length
    ) {
      setError(
        "No puedes asociar dos columnas al mismo campo."
      );
      return;
    }

    // Campos obligatorios para importar.
    const obligatorios: CampoImportacion[] = [
      "nombre",
      "categoria",
      "precio",
      "stock",
    ];

    const faltantes = obligatorios.filter(
      (campo) => !valoresAsociados.includes(campo)
    );

    if (faltantes.length > 0) {
      setError(
        `Debes asociar estas columnas: ${faltantes.join(", ")}.`
      );
      return;
    }

    const minimo = Number(minimoPredeterminado);

    if (
      minimoPredeterminado.trim() === "" ||
      !Number.isSafeInteger(minimo) ||
      minimo < 0
    ) {
      setError(
        "El stock minimo predeterminado debe ser un entero mayor o igual a cero."
      );
      return;
    }

    const codigos = new Set<string>(
      productos.map((producto) =>
        producto.codigo.toUpperCase()
      )
    );

    const nuevosProductos: Producto[] = [];

    const ultimoId = Math.max(
      0,
      ...productos.map((producto) => producto.id)
    );

    try {
      filasProductos.forEach((fila, indice) => {
        const numeroFila = indice + 2;

        const nombre = obtenerValor(fila, "nombre");
        const nombreCategoria = obtenerValor(
          fila,
          "categoria"
        );

        if (!nombre) {
          throw new Error(
            `Fila ${numeroFila}: falta el nombre del producto.`
          );
        }

        // Buscamos la categoria dentro del sistema.
        const categoria = categorias.find(
          (actual) =>
            actual.nombre.toLowerCase() ===
            nombreCategoria.toLowerCase()
        );

        if (!categoria) {
          throw new Error(
            `Fila ${numeroFila}: la categoria "${nombreCategoria}" no existe. Creala primero en Categorias.`
          );
        }

        const textoPrecio = obtenerValor(fila, "precio");
        const textoStock = obtenerValor(fila, "stock");
        const textoMinimo = obtenerValor(fila, "stockMinimo");

        if (!textoPrecio || !textoStock) {
          throw new Error(
            `Fila ${numeroFila}: faltan el precio o el stock.`
          );
        }

        const precio = convertirPrecio(textoPrecio);
        const stock = Number(textoStock);

        const stockMinimo = textoMinimo
          ? Number(textoMinimo)
          : minimo;

        if (
          !Number.isFinite(precio) ||
          precio <= 0 ||
          !Number.isSafeInteger(stock) ||
          stock < 0 ||
          !Number.isSafeInteger(stockMinimo) ||
          stockMinimo < 0
        ) {
          throw new Error(
            `Fila ${numeroFila}: el precio o las cantidades no son validos.`
          );
        }

        let codigo = obtenerValor(
          fila,
          "codigo"
        ).toUpperCase();

        if (!codigo) {
          codigo = generarCodigo(
            codigos,
            ultimoId + indice + 1
          );
        }

        if (codigos.has(codigo)) {
          throw new Error(
            `Fila ${numeroFila}: el codigo ${codigo} ya existe o esta duplicado.`
          );
        }

        codigos.add(codigo);

        nuevosProductos.push({
          id: ultimoId + indice + 1,
          codigo,
          nombre,
          categoria: categoria.nombre,
          precio,
          stock,
          stockMinimo,
        });
      });

      // Guardamos solamente si todas las filas son validas.
      setProductos((anteriores) => [
        ...anteriores,
        ...nuevosProductos,
      ]);

      setMensaje(
        `Se importaron ${nuevosProductos.length} productos correctamente.`
      );

      // Limpiamos la seleccion.
      setFilasArchivo([]);
      setAsociaciones({});
      setNombreArchivo("");
    } catch (errorCapturado) {
      setError(
        errorCapturado instanceof Error
          ? errorCapturado.message
          : "No se pudo completar la importacion."
      );
    }
  }

  return (
    <div className="pagina-excel">

      {/* Encabezado */}
      <div className="excel-introduccion">
        <FileSpreadsheet size={22} />

        <div>
          <h2>Herramientas de inventario</h2>

          <p>
            Importa productos desde Excel o CSV y descarga
            tu inventario actualizado.
          </p>
        </div>
      </div>

      {/* Herramientas */}
      <div className="excel-cuadricula">

        {/* Importacion */}
        <section className="panel excel-panel">
          <div className="excel-icono">
            <Upload size={23} />
          </div>

          <h3>Importar productos</h3>

          <p>
            Selecciona tu propio archivo Excel o CSV.
            Podras relacionar sus columnas con los campos
            de StockControl antes de importar.
          </p>

          <div className="excel-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={descargarPlantilla}
            >
              <FileDown size={17} />
              Descargar plantilla
            </button>

            <label className="boton-principal excel-boton-archivo">
              <Upload size={17} />
              Seleccionar archivo

              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={seleccionarArchivo}
                className="excel-input-oculto"
              />
            </label>
          </div>
        </section>

        {/* Exportacion */}
        <section className="panel excel-panel">
          <div className="excel-icono">
            <Download size={23} />
          </div>

          <h3>Exportar inventario</h3>

          <p>
            Descarga todos los productos registrados,
            incluyendo categorias, precios y stock actual.
          </p>

          <div className="excel-acciones">
            <button
              type="button"
              className="boton-principal"
              onClick={exportarInventario}
            >
              <Download size={17} />
              Exportar CSV
            </button>
          </div>
        </section>

      </div>

      {/* Asociacion de columnas */}
      {filasArchivo.length > 0 && (
        <section className="panel excel-mapeo">
          <h3>Preparar importacion</h3>

          <p className="excel-texto-secundario">
            Archivo seleccionado:{" "}
            <strong>{nombreArchivo}</strong>
          </p>

          <p className="excel-texto-secundario">
            {filasProductos.length} productos encontrados.
            Indica a que campo corresponde cada columna.
          </p>

          <div className="excel-tabla-columnas">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Columna del archivo</th>
                  <th>Campo en StockControl</th>
                </tr>
              </thead>

              <tbody>
                {columnas.map((columna, indice) => (
                  <tr key={indice}>
                    <td>
                      {columna || `Columna ${indice + 1}`}
                    </td>

                    <td>
                      <select
                        className="selector"
                        aria-label={`Asociar columna ${
                          columna || indice + 1
                        }`}
                        value={asociaciones[indice] ?? ""}
                        onChange={(evento) =>
                          cambiarAsociacion(
                            indice,
                            evento.target.value as
                              | CampoImportacion
                              | ""
                          )
                        }
                      >
                        <option value="">
                          No importar
                        </option>

                        {campos.map((campo) => (
                          <option
                            key={campo.valor}
                            value={campo.valor}
                          >
                            {campo.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stock minimo por defecto */}
          <div className="excel-minimo">
            <label htmlFor="minimoImportacion">
              Stock minimo predeterminado
            </label>

            <input
              id="minimoImportacion"
              type="number"
              min="0"
              step="1"
              value={minimoPredeterminado}
              onChange={(evento) =>
                setMinimoPredeterminado(
                  evento.target.value
                )
              }
            />

            <small>
              Se utiliza cuando el archivo no incluye
              stock minimo o alguna fila lo tiene vacio.
            </small>
          </div>

          {/* Vista previa del Excel */}
          <h4>Vista previa del archivo</h4>

          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  {columnas.map((columna, indice) => (
                    <th key={indice}>
                      {columna || `Columna ${indice + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filasProductos
                  .slice(0, 5)
                  .map((fila, indice) => (
                    <tr key={indice}>
                      {columnas.map(
                        (_, columnaIndice) => (
                          <td key={columnaIndice}>
                            {fila[columnaIndice] || "-"}
                          </td>
                        )
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <p className="excel-texto-secundario">
            Se muestran hasta 5 filas como ejemplo.
            Al confirmar se procesara el archivo completo.
          </p>

          <div className="excel-acciones">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => {
                setFilasArchivo([]);
                setAsociaciones({});
                setNombreArchivo("");
                setError("");
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="boton-principal"
              onClick={confirmarImportacion}
            >
              Importar {filasProductos.length} productos
            </button>
          </div>
        </section>
      )}

      {/* Mensajes de resultado */}
      {mensaje && (
        <div
          className="excel-mensaje excel-exito"
          role="status"
        >
          <CheckCircle2 size={19} />
          <span>{mensaje}</span>
        </div>
      )}

      {error && (
        <div
          className="excel-mensaje excel-error"
          role="alert"
        >
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {/* Informacion importante */}
      <section className="panel excel-informacion">
        <h3>Informacion importante</h3>

        <p>
          <strong>Descargar plantilla:</strong> obtiene un
          archivo CSV de ejemplo con las columnas necesarias
          para cargar productos nuevos.
        </p>

        <p>
          <strong>Importar productos:</strong> permite seleccionar
          un archivo Excel (.xlsx) o CSV (.csv) propio y relacionar
          sus columnas con los campos de StockControl.
        </p>

        <p>
          Los productos nuevos se agregan a los existentes.
          No se reemplazan los productos actuales ni se permiten
          codigos duplicados.
        </p>

        <p>
          <strong>Exportar inventario:</strong> descarga un CSV
          con todos los productos registrados, incluyendo
          precios y cantidades actuales.
        </p>

        <p>
          <strong>Consideraciones:</strong> las categorias deben
          existir previamente en el sistema. Si falta un codigo,
          se genera automaticamente. Si falta el stock minimo,
          se utiliza el valor predeterminado.
        </p>

        <p>
          Esta version demostrativa no utiliza base de datos.
          Los cambios se reinician al actualizar la pagina.
        </p>
      </section>

    </div>
  );
}

export default ExcelCSV;
