import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Venta, ProductoConLotes } from "@/types/inventory";
import { getExpiryStatus } from "./expiry";
import html2canvas from "html2canvas";

interface ReportOptions {
  store: string;
  range: string;
  ventas: (Venta & { productos: { tienda_id: number; nombre: string; categoria: string; articulo: string } })[];
  inventory: ProductoConLotes[];
}

export async function generatePdfReport({ store, range, ventas, inventory }: ReportOptions) {
  const doc = new jsPDF();
  const dateStr = format(new Date(), "dd 'de' MMMM, yyyy", { locale: es });
  
  // -- HEADER --
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, 210, 25, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FitHub — Reporte de Inventario", 14, 17);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  let rangeText = "Últimos 7 días";
  if (range === "mes") rangeText = "Últimos 30 días";
  if (range === "global") rangeText = "Histórico Global";
  
  doc.text(`Fecha de generación: ${dateStr}`, 14, 35);
  doc.text(`Tienda Filtro: ${store}`, 14, 42);
  doc.text(`Periodo analizado: ${rangeText}`, 14, 49);

  // -- CAPTURE CHART --
  const chartEl = document.getElementById("chart-container");
  let currentY = 55;
  
  if (chartEl) {
    try {
      const canvas = await html2canvas(chartEl, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      doc.text("Gráfico de Top Vendidos", 14, currentY);
      currentY += 5;
      doc.addImage(imgData, "PNG", 14, currentY, 180, 80);
      currentY += 90;
    } catch (e) {
      console.warn("Could not capture chart", e);
    }
  }

  // -- VENTAS (TOP) --
  // Aggregate sales by (producto_id + tienda_id)
  const salesMap: Record<string, { id_prod: string; tienda: string; nombre: string; cantidad: number; categoria: string; articulo: string }> = {};
  let totalVendidos = 0;
  
  for (const v of ventas) {
    if (!v.productos) continue;
    totalVendidos += v.cantidad;
    
    // key depends on product and store to keep them separate if analyzing both stores
    const tiendaStr = v.productos.tienda_id === 2 ? "Sur" : "Norte";
    const key = `${v.producto_id}-${tiendaStr}`;
    
    if (!salesMap[key]) {
      salesMap[key] = { 
        id_prod: v.producto_id,
        tienda: tiendaStr,
        nombre: v.productos.nombre, 
        cantidad: 0, 
        categoria: v.productos.categoria || "Otros",
        articulo: v.productos.articulo || "N/A"
      };
    }
    salesMap[key].cantidad += v.cantidad;
  }
  
  // Sort: Tienda (Z-A so Sur, then Norte... wait, Norte then Sur is A-Z. Let's do A-Z for Tienda) -> Categoria (A-Z) -> Nombre (A-Z)
  const sortedSales = Object.values(salesMap).sort((a, b) => {
    if (a.tienda !== b.tienda) return a.tienda.localeCompare(b.tienda);
    if (a.categoria !== b.categoria) return a.categoria.localeCompare(b.categoria);
    return a.nombre.localeCompare(b.nombre);
  });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Resumen de Ventas (${totalVendidos} uds)`, 14, currentY);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [["Tienda", "Categoría", "Artículo (ID)", "Producto", "Vendidos"]],
    body: sortedSales.map(s => [s.tienda, s.categoria, s.articulo, s.nombre, s.cantidad.toString()]),
    headStyles: { fillColor: [5, 150, 105] },
    theme: "striped",
    styles: { fontSize: 8 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // -- STOCK CRÍTICO --
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Stock Crítico (Vencidos / Próximos)", 14, currentY);

  const criticos: { tienda: string; articulo: string; nombre: string; caducidad: string; estado: string; loteQty: number }[] = [];
  
  for (const product of inventory) {
    if (product.lotes.length === 0) continue;
    
    for (const lote of product.lotes) {
      if (!lote.fecha_caducidad) continue;
      const status = getExpiryStatus(lote.fecha_caducidad);
      if (status === "vencido" || status === "proximo") {
        criticos.push({
          tienda: product.tienda_nombre || "Norte",
          articulo: product.articulo || "N/A",
          nombre: product.nombre,
          caducidad: lote.fecha_caducidad,
          estado: status === "vencido" ? "VENCIDO" : "Próximo a vencer",
          loteQty: lote.cantidad
        });
      }
    }
  }

  criticos.sort((a, b) => {
    if (a.tienda !== b.tienda) return a.tienda.localeCompare(b.tienda);
    return new Date(a.caducidad).getTime() - new Date(b.caducidad).getTime();
  });

  if (criticos.length === 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("No hay lotes en estado crítico.", 14, currentY + 8);
  } else {
    autoTable(doc, {
      startY: currentY + 5,
      head: [["Estado", "Fecha Cad.", "Tienda", "Articulo", "Producto", "Uds"]],
      body: criticos.map(c => [c.estado, format(new Date(c.caducidad), "dd/MM/yyyy"), c.tienda, c.articulo, c.nombre, c.loteQty.toString()]),
      headStyles: { fillColor: [220, 38, 38] }, // Red header for critical
      theme: "striped",
      styles: { fontSize: 8 },
      didParseCell: (data) => {
        if (data.row.index > -1 && data.column.index === 0) {
          if (data.cell.text[0] === "VENCIDO") {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [217, 119, 6];
          }
        }
      }
    });
  }

  // Descargar
  const safeStore = store === "Ambas" ? "Ambas_Tiendas" : store;
  doc.save(`Fithub_Reporte_${safeStore}_${dateStr.replace(/ /g, "_")}.pdf`);
}
