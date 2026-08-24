/**
 * Backup Service — Generates the 5-sheet Excel global backup.
 *
 * Extracted from ajustes.tsx to make it testable and reusable.
 */

import * as XLSX from "xlsx";
import type {
  ProductoConLotes,
  Merma,
  Traspaso,
  RegistroHorario,
  Visita,
} from "@/types/inventory";

export interface BackupData {
  inventory: ProductoConLotes[];
  logs: RegistroHorario[];
  visitas: Visita[];
  mermas: Merma[];
  traspasos: Traspaso[];
}

/**
 * Generates a 5-sheet XLSX workbook from the provided data and
 * triggers a browser download.
 */
export function exportGlobalBackup(data: BackupData): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Inventario
  const invData = data.inventory.map((p) => ({
    ID: p.id,
    SKU: p.articulo,
    Sicol: p.sicol,
    Nombre: p.nombre,
    Categoría: p.categoria || "Otros",
    Proveedor: p.proveedor_nombre,
    Stock_Total:
      p.lotes?.reduce((acc, l) => acc + (l.cantidad || 0), 0) || 0,
    Lotes_Activos: p.lotes?.filter((l) => l.cantidad > 0).length || 0,
    Tienda: p.tienda_nombre,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invData), "Inventario");

  // Sheet 2: Horarios
  const logsData = data.logs.map((l) => ({
    ID: l.id,
    Tienda_ID: l.tienda_id,
    Tipo: l.tipo === "entrada" ? "Entrada" : "Salida",
    Fecha_Hora: l.created_at,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logsData), "Horarios");

  // Sheet 3: Visitas
  const visitasData = data.visitas.map((v) => ({
    ID: v.id,
    Tienda_ID: v.tienda_id,
    Fecha: v.fecha,
    Notas: v.notas || "—",
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(visitasData), "Visitas");

  // Sheet 4: Mermas
  const mermasData = (data.mermas || []).map((m) => ({
    ID: m.id,
    Producto_ID: m.producto_id,
    Tienda_ID: m.tienda_id,
    Cantidad: m.cantidad,
    Motivo: m.motivo,
    Notas: m.notas || "—",
    Usuario: m.usuario || "—",
    Fecha: m.created_at,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mermasData), "Mermas");

  // Sheet 5: Traspasos
  const traspasosData = (data.traspasos || []).map((t) => ({
    ID: t.id,
    SKU: t.articulo,
    Producto: t.nombre,
    Origen: t.origen_tienda_nombre,
    Destino: t.destino_tienda_nombre,
    Cantidad: t.cantidad,
    Fecha_Caducidad: t.fecha_caducidad || "—",
    Motivo: t.motivo || "—",
    Usuario: t.usuario || "—",
    Fecha: t.created_at,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(traspasosData), "Traspasos");

  // Trigger download
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Backup_Global_FitHub_${today}.xlsx`);
}
