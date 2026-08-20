export type StoreId = "Sur" | "Norte" | "Centro";
export type StoreFilter = StoreId | "Ambas" | "Todas";

// Database types
export interface Tienda {
  id: number;
  codigo: number;
  nombre: StoreId;
}

export interface Producto {
  id: string;
  tienda_id: number;
  articulo: string;
  sicol: string;
  nombre: string;
  categoria: string | null;
  proveedor_nombre: string;
  proveedor_codigo: string | null;
  notas: string | null;
  created_at: string;
}

export interface Lote {
  id: string;
  producto_id: string;
  cantidad: number;
  fecha_caducidad: string | null; // ISO date or null
  fecha_ingreso: string;
  notas: string | null;
  created_at: string;
  vendidos?: number;
}

export interface Venta {
  id: string;
  producto_id: string;
  lote_id: string | null;
  cantidad: number;
  created_at: string;
}

export type MotivoMerma = "caducidad" | "perdida_bodega" | "averia" | "descuadre";

export interface Merma {
  id: string;
  producto_id: string;
  lote_id: string | null;
  tienda_id: number;
  cantidad: number;
  motivo: MotivoMerma;
  notas: string | null;
  created_at: string;
  usuario?: string;
}

export interface Visita {
  id: string;
  tienda_id: number;
  fecha: string; // YYYY-MM-DD
  notas: string | null;
  created_at: string;
}

export interface RegistroHorario {
  id: string;
  tipo: "entrada" | "salida";
  tienda_id: number | null;
  created_at: string;
}

// Frontend enriched types
export interface ProductoConLotes extends Producto {
  lotes: Lote[];
  tienda_nombre: StoreId;
  vendidos_total: number;
}

export interface NewProductInput {
  tienda_id: number;
  articulo: string;
  sicol: string;
  nombre: string;
  categoria: string;
  proveedor_nombre: string;
  proveedor_codigo?: string;
  notas?: string;
}

export interface NewLoteInput {
  cantidad: number;
  fecha_caducidad: string | null;
}
