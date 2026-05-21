export type StoreId = "Sur" | "Norte";
export type StoreFilter = StoreId | "Ambas";

export interface Lote {
  id: string;
  cantidad: number;
  fecha_caducidad: string; // ISO
}

export interface InventoryItem {
  id: string;
  id_tienda: StoreId;
  sku: string;
  nombre: string;
  linea_producto: string;
  subcategoria_sabor: string;
  proveedor: string;
  lotes: Lote[];
}

export interface NewProductInput {
  id_tienda: StoreId;
  sku: string;
  nombre: string;
  linea_producto: string;
  subcategoria_sabor: string;
  proveedor: string;
  cantidad: number;
  fecha_caducidad: string;
}

export interface NewLoteInput {
  cantidad: number;
  fecha_caducidad: string;
}
