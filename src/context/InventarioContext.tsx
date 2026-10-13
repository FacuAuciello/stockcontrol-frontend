
import { useState, type ReactNode } from "react";

import {
  productosIniciales,
  movimientosIniciales,
} from "../data/datosIniciales";

import {
  InventarioContext,
  type Producto,
  type Movimiento,
  type TipoMovimiento,
  type NuevoMovimiento,
} from "./inventarioContextDef";

// Componente que administra el inventario compartido.
export function InventarioProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [productos, setProductos] = useState<Producto[]>(
    productosIniciales
  );

  const [movimientos, setMovimientos] = useState<Movimiento[]>(
    () =>
      movimientosIniciales.map((movimiento) => ({
        ...movimiento,
        tipo: movimiento.tipo as TipoMovimiento,
      }))
  );

  // Registra una entrada o salida y actualiza el stock.
  function registrarMovimiento(datos: NuevoMovimiento): string | null {
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

    // Actualizamos el stock del producto seleccionado.
    setProductos((anteriores) =>
      anteriores.map((actual) =>
        actual.id === datos.idProducto
          ? { ...actual, stock: nuevoStock }
          : actual
      )
    );

    // Registramos la operacion en el historial.
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
        movimientos,
        registrarMovimiento,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
}
