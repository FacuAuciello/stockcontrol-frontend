
import { createContext, type Dispatch, type SetStateAction } from "react";

// Estructura de un producto.
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
}

// Tipos de movimientos permitidos.
export type TipoMovimiento = "ENTRADA" | "SALIDA";

// Estructura de un movimiento.
export interface Movimiento {
  id: number;
  producto: string;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string;
  motivo?: string;
  stockResultante?: number;
}

// Datos necesarios para registrar un movimiento.
export interface NuevoMovimiento {
  idProducto: number;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
}

// Contrato del contexto de inventario.
export interface InventarioContextType {
  productos: Producto[];
  setProductos: Dispatch<SetStateAction<Producto[]>>;
  movimientos: Movimiento[];
  registrarMovimiento: (datos: NuevoMovimiento) => string | null;
}

// Creamos el contexto compartido.
export const InventarioContext = createContext<
  InventarioContextType | undefined
>(undefined);
