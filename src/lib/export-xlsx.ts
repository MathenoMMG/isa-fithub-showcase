import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { InventoryItem, Merma } from "@/types/inventory";
import { formatExpiryDate, getExpiryStatus } from "./expiry";
import { formatInBogota } from "./date-utils";

const statusLabel: Record<ReturnType<typeof getExpiryStatus>, string> = {
  vencido: "Vencido",
  proximo: "Próximo a vencer",
  en_regla: "En regla",
};

const MOTIVOS: Record<string, string> = {
  caducidad: "Caducidad / Vencimiento",
  perdida_bodega: "Pérdida en Bodega / No exhibido",
  averia: "Avería / Empaque dañado",
  descuadre: "Descuadre en conteo físico",
};

const TIENDA_NAMES: Record<number, string> = { 1: "Norte", 2: "Sur", 3: "Centro" };

export function exportInventoryToExcel(items: InventoryItem[], mermas: Merma[] = [], filename?: string) {
  // 1. Hoja de Inventario
  const rows: Record<string, string | number>[] = [];
  for (const item of items) {
    if (item.lotes.length === 0) {
      rows.push({
        "Tienda": item.tienda_nombre,
        "Categoría": item.categoria || "Otros",
        "SKU / Sicol": item.sicol || "—",
        "Código (Artículo)": item.articulo || "—",
        "Producto": item.nombre,
        "Lote #": "—",
        "Cantidad": 0,
        "Fecha de Caducidad": "—",
        "Estado": "Sin stock",
        "Proveedor": item.proveedor_nombre || "—",
        "Notas": item.notas || "—",
      });
      continue;
    }
    item.lotes.forEach((lote, idx) => {
      rows.push({
        "Tienda": item.tienda_nombre,
        "Categoría": item.categoria || "Otros",
        "SKU / Sicol": item.sicol || "—",
        "Código (Artículo)": item.articulo || "—",
        "Producto": item.nombre,
        "Lote #": idx + 1,
        "Cantidad": lote.cantidad,
        "Fecha de Caducidad": formatExpiryDate(lote.fecha_caducidad),
        "Estado": lote.cantidad > 0 ? statusLabel[getExpiryStatus(lote.fecha_caducidad)] : "Agotado",
        "Proveedor": item.proveedor_nombre || "—",
        "Notas": lote.notas || item.notas || "—",
      });
    });
  }

  const wb = XLSX.utils.book_new();
  const wsInv = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsInv, "Inventario");

  // 2. Hoja de Mermas y Pérdidas
  if (mermas && mermas.length > 0) {
    const mermaRows = mermas.map(m => {
      const prod = items.find(p => p.id === m.producto_id);
      return {
        "Fecha": formatInBogota(m.created_at, "yyyy-MM-dd HH:mm"),
        "Tienda": TIENDA_NAMES[m.tienda_id] || "—",
        "Producto": prod?.nombre || "Producto",
        "SKU / Artículo": prod?.articulo || "—",
        "Categoría": prod?.categoria || "Otros",
        "Cantidad Mermada": m.cantidad,
        "Motivo": MOTIVOS[m.motivo] || m.motivo,
        "Usuario": m.usuario || "Usuario",
        "Notas": m.notas || "—",
      };
    });
    const wsMermas = XLSX.utils.json_to_sheet(mermaRows);
    XLSX.utils.book_append_sheet(wb, wsMermas, "Mermas y Pérdidas");
  }

  const name = filename ?? `fithub_inventario_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
  XLSX.writeFile(wb, name);
}
