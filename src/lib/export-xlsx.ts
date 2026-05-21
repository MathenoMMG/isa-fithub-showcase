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
        SKU: item.sku,
        Producto: item.nombre,
        "Sabor / Subcategoría": item.subcategoria_sabor,
        Línea: item.linea_producto,
        Tienda: item.id_tienda,
        "Lote #": "—",
        "ID Lote": "—",
        Cantidad: 0,
        "Fecha de Caducidad": "—",
        Estado: "Sin stock",
        Proveedor: item.proveedor,
      });
      continue;
    }
    item.lotes.forEach((lote, idx) => {
      rows.push({
        SKU: item.sku,
        Producto: item.nombre,
        "Sabor / Subcategoría": item.subcategoria_sabor,
        Línea: item.linea_producto,
        Tienda: item.id_tienda,
        "Lote #": idx + 1,
        "ID Lote": lote.id,
        Cantidad: lote.cantidad,
        "Fecha de Caducidad": formatExpiryDate(lote.fecha_caducidad),
        Estado: statusLabel[getExpiryStatus(lote.fecha_caducidad)],
        Proveedor: item.proveedor,
      });
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");

  const name = filename ?? `inventario_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
  XLSX.writeFile(wb, name);
}
