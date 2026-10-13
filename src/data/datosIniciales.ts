
/*
 * Datos ficticios de una libreria.
 * Se utilizan para mostrar productos y movimientos
 * sin necesidad de una base de datos.
 */

export const productosIniciales = [
  {
    id: 1,
    codigo: "LIB-001",
    nombre: "Cuaderno universitario A4",
    categoria: "Cuadernos",
    precio: 4500,
    stock: 3,
    stockMinimo: 10,
  },
  {
    id: 2,
    codigo: "LIB-002",
    nombre: "Lapicera BIC azul",
    categoria: "Escritura",
    precio: 850,
    stock: 0,
    stockMinimo: 20,
  },
  {
    id: 3,
    codigo: "LIB-003",
    nombre: "Resma A4 500 hojas",
    categoria: "Papeleria",
    precio: 8500,
    stock: 5,
    stockMinimo: 10,
  },
  {
    id: 4,
    codigo: "LIB-004",
    nombre: "Carpeta escolar N3",
    categoria: "Carpetas",
    precio: 3200,
    stock: 35,
    stockMinimo: 10,
  },
  {
    id: 5,
    codigo: "LIB-005",
    nombre: "Marcadores de colores x12",
    categoria: "Escritura",
    precio: 6200,
    stock: 22,
    stockMinimo: 8,
  },
];

export const movimientosIniciales = [
  {
    id: 1,
    producto: "Carpeta escolar N3",
    tipo: "ENTRADA",
    cantidad: 15,
    fecha: "12/10/2026",
  },
  {
    id: 2,
    producto: "Cuaderno universitario A4",
    tipo: "SALIDA",
    cantidad: 4,
    fecha: "11/10/2026",
  },
  {
    id: 3,
    producto: "Resma A4 500 hojas",
    tipo: "ENTRADA",
    cantidad: 10,
    fecha: "10/10/2026",
  },
];
