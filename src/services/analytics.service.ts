/**
 * Analytics Service — Pure Supabase data layer for sales fetching,
 * aggregation helpers, and report generation support.
 */

import { supabase } from "@/lib/supabase";
import type { ProductoConLotes, StoreId } from "@/types/inventory";
import { getExpiryStatus } from "@/lib/expiry";

// ─── Constants ───────────────────────────────────────────────────────
export const STORE_ID_MAP: Record<StoreId, number> = {
  Norte: 1,
  Sur: 2,
  Centro: 3,
};

// ─── Fetch Sales Data ────────────────────────────────────────────────
export interface SaleRecord {
  id: string;
  producto_id: string;
  lote_id: string | null;
  cantidad: number;
  created_at: string;
  productos: {
    tienda_id: number;
    nombre: string;
    categoria: string | null;
    articulo: string;
  } | null;
}

export async function fetchSalesData(
  selectedStores: StoreId[],
  rangeDays: number,
): Promise<SaleRecord[]> {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - rangeDays);
  const isoLimit = dateLimit.toISOString();

  const { data: ventas, error } = await supabase
    .from("ventas")
    .select("*, productos(tienda_id, nombre, categoria, articulo)")
    .gte("created_at", isoLimit);

  if (error) throw error;

  const selectedStoreIds = selectedStores.map((st) => STORE_ID_MAP[st]);
  return (ventas || []).filter(
    (v: SaleRecord) =>
      v.productos && selectedStoreIds.includes(v.productos.tienda_id),
  );
}

// ─── Aggregation Helpers ─────────────────────────────────────────────

export interface CategorySalesData {
  name: string;
  value: number;
}

export interface TopProductData {
  nombre: string;
  articulo: string;
  unidades: number;
  categoria: string;
}

export interface CriticalStockItem {
  id: string;
  nombre: string;
  tienda: StoreId;
  loteId: string;
  cantidad: number;
  fecha: string | null;
  dias: number;
  estado: string;
}

/**
 * Aggregate sales by category for pie charts.
 */
export function aggregateSalesByCategory(
  sales: SaleRecord[],
): CategorySalesData[] {
  const map: Record<string, number> = {};
  for (const v of sales) {
    const cat = v.productos?.categoria || "Otros";
    map[cat] = (map[cat] || 0) + v.cantidad;
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Get top N best-selling products.
 */
export function getTopProducts(
  sales: SaleRecord[],
  limit = 10,
): TopProductData[] {
  const map: Record<
    string,
    { nombre: string; articulo: string; unidades: number; categoria: string }
  > = {};

  for (const v of sales) {
    if (!v.productos) continue;
    const key = v.producto_id;
    if (!map[key]) {
      map[key] = {
        nombre: v.productos.nombre,
        articulo: v.productos.articulo,
        unidades: 0,
        categoria: v.productos.categoria || "Otros",
      };
    }
    map[key].unidades += v.cantidad;
  }

  return Object.values(map)
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, limit);
}

/**
 * Get products with lotes approaching or past expiry.
 */
export function getCriticalStock(
  items: ProductoConLotes[],
): CriticalStockItem[] {
  const criticals: CriticalStockItem[] = [];

  for (const prod of items) {
    for (const lote of prod.lotes) {
      if (lote.cantidad <= 0 || !lote.fecha_caducidad) continue;
      const status = getExpiryStatus(lote.fecha_caducidad);
      if (status === "expired" || status === "warning") {
        const dias = Math.ceil(
          (new Date(lote.fecha_caducidad).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        );
        criticals.push({
          id: prod.id,
          nombre: prod.nombre,
          tienda: prod.tienda_nombre,
          loteId: lote.id,
          cantidad: lote.cantidad,
          fecha: lote.fecha_caducidad,
          dias,
          estado: status,
        });
      }
    }
  }

  return criticals.sort((a, b) => a.dias - b.dias);
}
