
import { useState, type ReactNode } from "react";

import {
  productosIniciales,
  movimientosIniciales,
} from "../data/datosIniciales";

import {
  InventarioContext,
  type Producto,
  type Categoria,
  type Movimiento,
  type TipoMovimiento,
  type NuevoMovimiento,
} from "./inventarioContextDef";

// Categorias iniciales de nuestra libreria.
const categoriasIniciales: Categoria[] = [
  { id: 1, nombre: "Cuadernos" },
  { id: 2, nombre: "Escritura" },
  { id: 3, nombre: "Papeleria" },
  { id: 4, nombre: "Carpetas" },
];

export function InventarioProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [productos, setProductos] = useState<Producto[]>(
    productosIniciales
  );

  const [categorias, setCategorias] = useState<Categoria[]>(
    categoriasIniciales
  );

  const [movimientos, setMovimientos] = useState<Movimiento[]>(
    () =>
      movimientosIniciales.map((movimiento) => ({
        ...movimiento,
        tipo: movimiento.tipo as TipoMovimiento,
      }))
  );

  // Comprueba que una categoria no tenga nombre duplicado.
  function nombreCategoriaExiste(
    nombre: string,
    idExcluir?: number
  ) {
    return categorias.some(
      (categoria) =>
        categoria.nombre.toLowerCase() === nombre.toLowerCase() &&
        categoria.id !== idExcluir
    );
  }

  // Crea una categoria nueva.
  function crearCategoria(nombre: string): string | null {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      return "Ingresa el nombre de la categoria.";
    }

    if (nombreCategoriaExiste(nombreLimpio)) {
      return "Ya existe una categoria con ese nombre.";
    }

    const nuevoId =
      Math.max(0, ...categorias.map((categoria) => categoria.id)) + 1;

    const nuevaCategoria: Categoria = {
      id: nuevoId,
      nombre: nombreLimpio,
    };

    setCategorias((anteriores) => [
      ...anteriores,
      nuevaCategoria,
    ]);

    return null;
  }

  // Edita una categoria y actualiza los productos asociados.
  function editarCategoria(
    id: number,
    nombre: string
  ): string | null {
    const categoriaActual = categorias.find(
      (categoria) => categoria.id === id
    );

    if (!categoriaActual) {
      return "La categoria no existe.";
    }

    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      return "Ingresa el nombre de la categoria.";
    }

    if (nombreCategoriaExiste(nombreLimpio, id)) {
      return "Ya existe una categoria con ese nombre.";
    }

    const nombreAnterior = categoriaActual.nombre;

    setCategorias((anteriores) =>
      anteriores.map((categoria) =>
        categoria.id === id
          ? { ...categoria, nombre: nombreLimpio }
          : categoria
      )
    );

    // Los productos guardan el nombre de su categoria.
    // Por eso tambien debemos actualizarlo al renombrarla.
    setProductos((anteriores) =>
      anteriores.map((producto) =>
        producto.categoria === nombreAnterior
          ? { ...producto, categoria: nombreLimpio }
          : producto
      )
    );

    return null;
  }

  // Solo permite eliminar categorias sin productos.
  function eliminarCategoria(id: number): string | null {
    const categoria = categorias.find(
      (categoria) => categoria.id === id
    );

    if (!categoria) {
      return "La categoria no existe.";
    }

    const tieneProductos = productos.some(
      (producto) => producto.categoria === categoria.nombre
    );

    if (tieneProductos) {
      return "No se puede eliminar una categoria que tiene productos asociados.";
    }

    setCategorias((anteriores) =>
      anteriores.filter((actual) => actual.id !== id)
    );

    return null;
  }

  // Registra entradas y salidas de mercaderia.
  function registrarMovimiento(
    datos: NuevoMovimiento
  ): string | null {
    const producto = productos.find(
      (producto) => producto.id === datos.idProducto
    );

    if (!producto) {
      return "El producto seleccionado no existe.";
    }

    if (
      !Number.isInteger(datos.cantidad) ||
      datos.cantidad <= 0
    ) {
      return "La cantidad debe ser un numero entero mayor a cero.";
    }

    if (datos.tipo !== "ENTRADA" && datos.tipo !== "SALIDA") {
      return "El tipo de movimiento no es valido.";
    }

    if (
      datos.tipo === "SALIDA" &&
      datos.cantidad > producto.stock
    ) {
      return "No hay suficiente stock para registrar la salida.";
    }

    const nuevoStock =
      datos.tipo === "ENTRADA"
        ? producto.stock + datos.cantidad
        : producto.stock - datos.cantidad;

    setProductos((anteriores) =>
      anteriores.map((actual) =>
        actual.id === datos.idProducto
          ? { ...actual, stock: nuevoStock }
          : actual
      )
    );

    const nuevoMovimiento: Movimiento = {
      id: Math.max(0, ...movimientos.map((m) => m.id)) + 1,
      producto: producto.nombre,
      tipo: datos.tipo,
      cantidad: datos.cantidad,
      fecha: new Date().toLocaleString("es-AR"),
      motivo: datos.motivo.trim(),
      stockResultante: nuevoStock,
    };

    setMovimientos((anteriores) => [
      nuevoMovimiento,
      ...anteriores,
    ]);

    return null;
  }

  return (
    <InventarioContext.Provider
      value={{
        productos,
        setProductos,
        categorias,
        crearCategoria,
        editarCategoria,
        eliminarCategoria,
        movimientos,
        registrarMovimiento,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
}
