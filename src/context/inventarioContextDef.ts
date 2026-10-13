
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

// Estructura de una categoria.
export interface Categoria {
  id: number;
  nombre: string;
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

// Informacion y funciones compartidas.
export interface InventarioContextType {
  productos: Producto[];
  setProductos: Dispatch<SetStateAction<Producto[]>>;

  categorias: Categoria[];
  crearCategoria: (nombre: string) => string | null;
  editarCategoria: (id: number, nombre: string) => string | null;
  eliminarCategoria: (id: number) => string | null;

  movimientos: Movimiento[];
  registrarMovimiento: (datos: NuevoMovimiento) => string | null;
}

// Contexto compartido del inventario.
export const InventarioContext = createContext<
  InventarioContextType | undefined
>(undefined);
