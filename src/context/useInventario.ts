
import { useContext } from "react";
import { InventarioContext } from "./inventarioContextDef";

// Hook personalizado para acceder al inventario compartido.
export function useInventario() {
  const contexto = useContext(InventarioContext);

  // Verificamos que se utilice dentro del Provider.
  if (contexto === undefined) {
    throw new Error(
      "useInventario debe utilizarse dentro de InventarioProvider"
    );
  }

  return contexto;
}
