export type StoreId = "Sur" | "Norte";
export type StoreFilter = StoreId | "Ambas";

export interface InventoryItem {
  id: string;
  id_tienda: StoreId;
  sku: string;
  nombre: string;
  linea_producto: string;
  subcategoria_sabor: string;
  cantidad: number;
  fecha_caducidad: string; // ISO
  proveedor: string;
}
