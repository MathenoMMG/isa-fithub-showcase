import { differenceInDays, parseISO, getDay, getHours } from "date-fns";
import type { Venta, ProductoConLotes } from "@/types/inventory";
import { getBogotaDate } from "./date-utils";

// Definir el rango en días para el cálculo base (ej. últimos 7 o 30 días)
export const calculateRunRate = (ventas: Venta[], windowDays: number): number => {
  if (ventas.length === 0 || windowDays <= 0) return 0;
  const totalVendidos = ventas.reduce((acc, v) => acc + v.cantidad, 0);
  return totalVendidos / windowDays;
};

export const predictStockoutDays = (stockAcual: number, runRate: number): number | null => {
  if (runRate <= 0) return null; // Nunca se agota si no se vende
  return Math.ceil(stockAcual / runRate);
};

export interface SlowMover {
  producto: ProductoConLotes;
  diasSinVenta: number;
  stockActual: number;
}

export const getSlowMovers = (
  productos: ProductoConLotes[],
  ventas: Venta[],
  thresholdDays: number = 14
): SlowMover[] => {
  const now = new Date();
  
  // Mapa de la última venta por producto
  const lastSaleMap = new Map<string, Date>();
  for (const v of ventas) {
    const d = parseISO(v.created_at);
    const existing = lastSaleMap.get(v.producto_id);
    if (!existing || d > existing) {
      lastSaleMap.set(v.producto_id, d);
    }
  }

  const result: SlowMover[] = [];

  for (const p of productos) {
    const currentStock = p.lotes.reduce((acc, l) => acc + l.cantidad, 0);
    if (currentStock === 0) continue; // Si no hay stock, no es un slow mover, está agotado

    const lastSale = lastSaleMap.get(p.id);
    let diasSinVenta = 999;
    
    if (lastSale) {
      diasSinVenta = differenceInDays(now, lastSale);
    }

    if (diasSinVenta >= thresholdDays) {
      result.push({ producto: p, diasSinVenta, stockActual: currentStock });
    }
  }

  return result.sort((a, b) => b.stockActual - a.stockActual); // Priorizar los que tienen más stock retenido
};

export interface RestockSuggestion {
  producto: ProductoConLotes;
  ventas7Dias: number;
  stockActual: number;
  sugerido: number;
}

export const getRestockSuggestions = (
  productos: ProductoConLotes[],
  ventasRecientes: Venta[] // Se espera que sean ventas de los últimos 7 días
): RestockSuggestion[] => {
  const salesMap = new Map<string, number>();
  for (const v of ventasRecientes) {
    salesMap.set(v.producto_id, (salesMap.get(v.producto_id) || 0) + v.cantidad);
  }

  const suggestions: RestockSuggestion[] = [];

  for (const p of productos) {
    const soldLast7Days = salesMap.get(p.id) || 0;
    const currentStock = p.lotes.reduce((acc, l) => acc + l.cantidad, 0);
    
    // Si se vendió más de lo que tenemos (para cubrir otros 7 días), sugerir la diferencia
    const sugerido = Math.max(0, soldLast7Days - currentStock);
    
    if (sugerido > 0) {
      suggestions.push({
        producto: p,
        ventas7Dias: soldLast7Days,
        stockActual: currentStock,
        sugerido
      });
    }
  }

  return suggestions.sort((a, b) => b.sugerido - a.sugerido);
};

// Mapa de calor por día de la semana (0 = Domingo, 1 = Lunes...) en Colombia
export const getSalesByDayOfWeek = (ventas: Venta[]) => {
  const days = [0, 0, 0, 0, 0, 0, 0];
  for (const v of ventas) {
    const bogotaDate = getBogotaDate(v.created_at);
    const day = bogotaDate.getDay();
    days[day] += v.cantidad;
  }
  return [
    { name: "Dom", value: days[0] },
    { name: "Lun", value: days[1] },
    { name: "Mar", value: days[2] },
    { name: "Mié", value: days[3] },
    { name: "Jue", value: days[4] },
    { name: "Vie", value: days[5] },
    { name: "Sáb", value: days[6] },
  ];
};

// Franja horaria: Mañana (06:00 - 11:59), Tarde (12:00 - 17:59), Noche (18:00 - 23:59) en Colombia
export const getSalesByTimeOfDay = (ventas: Venta[]) => {
  let manana = 0;
  let tarde = 0;
  let noche = 0;

  for (const v of ventas) {
    const bogotaDate = getBogotaDate(v.created_at);
    const h = bogotaDate.getHours();
    if (h >= 6 && h < 12) manana += v.cantidad;
    else if (h >= 12 && h < 18) tarde += v.cantidad;
    else noche += v.cantidad;
  }

  return [
    { name: "Mañana", value: manana },
    { name: "Tarde", value: tarde },
    { name: "Noche", value: noche }
  ];
};
