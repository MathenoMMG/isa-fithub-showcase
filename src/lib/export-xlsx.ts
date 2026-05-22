import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { InventoryItem } from "@/types/inventory";
import { formatExpiryDate, getExpiryStatus } from "./expiry";

const statusLabel: Record<ReturnType<typeof getExpiryStatus>, string> = {
  vencido: "Vencido",
  proximo: "Próximo a vencer",
  en_regla: "En regla",
};

export function exportInventoryToExcel(items: InventoryItem[], filename?: string) {
  // Una fila por lote — formato indexado para conciliaciones.
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
        "Estado": statusLabel[getExpiryStatus(lote.fecha_caducidad)],
        "Proveedor": item.proveedor_nombre || "—",
        "Notas": lote.notas || item.notas || "—",
      });
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");

  const name = filename ?? `inventario_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
  XLSX.writeFile(wb, name);
}
