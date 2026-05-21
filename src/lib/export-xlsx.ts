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
  const rows = items.map((item) => ({
    SKU: item.sku,
    Producto: item.nombre,
    "Sabor / Subcategoría": item.subcategoria_sabor,
    Línea: item.linea_producto,
    Tienda: item.id_tienda,
    Cantidad: item.cantidad,
    "Fecha de Caducidad": formatExpiryDate(item.fecha_caducidad),
    Estado: statusLabel[getExpiryStatus(item.fecha_caducidad)],
    Proveedor: item.proveedor,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");

  const name = filename ?? `inventario_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
  XLSX.writeFile(wb, name);
}
