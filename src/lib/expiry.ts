import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Lote } from "@/types/inventory";

export type ExpiryStatus = "vencido" | "proximo" | "en_regla";

export function getDaysUntilExpiry(fecha: string | null | undefined): number {
  if (!fecha) return 9999;
  try {
    return differenceInCalendarDays(parseISO(fecha), new Date());
  } catch {
    return 9999;
  }
}

export function getExpiryStatus(fecha: string | null | undefined): ExpiryStatus {
  if (!fecha) return "en_regla";
  const days = getDaysUntilExpiry(fecha);
  if (days < 0) return "vencido";
  if (days <= 30) return "proximo";
  return "en_regla";
}

export function formatExpiryDate(fecha: string | null | undefined): string {
  if (!fecha) return "—";
  try {
    return format(parseISO(fecha), "dd MMM yyyy", { locale: es });
  } catch {
    return "—";
  }
}

// ---- Lotes aggregations ----

export function getTotalQty(lotes: Lote[]): number {
  return (lotes || []).reduce((acc, l) => acc + (l?.cantidad || 0), 0);
}

export function countLotesByStatus(lotes: Lote[]) {
  let vencidos = 0;
  let proximos = 0;
  let en_regla = 0;
  for (const l of lotes || []) {
    if (!l || l.cantidad <= 0) continue; // Ignorar lotes sin stock
    const s = getExpiryStatus(l.fecha_caducidad);
    if (s === "vencido") vencidos++;
    else if (s === "proximo") proximos++;
    else en_regla++;
  }
  return { vencidos, proximos, en_regla };
}

/** Worst status across the product's lotes (vencido > proximo > en_regla). */
export function getWorstStatus(lotes: Lote[]): ExpiryStatus {
  const activeLotes = (lotes || []).filter((l) => l && l.cantidad > 0);
  const c = countLotesByStatus(activeLotes);
  if (c.vencidos > 0) return "vencido";
  if (c.proximos > 0) return "proximo";
  return "en_regla";
}

/** Earliest expiry date among active lotes, or null. */
export function getEarliestExpiry(lotes: Lote[]): string | null {
  const activeLotes = (lotes || []).filter((l) => l && l.cantidad > 0 && l.fecha_caducidad != null);
  if (activeLotes.length === 0) return null;
  return [...activeLotes].sort((a, b) => {
    try {
      return parseISO(a.fecha_caducidad!).getTime() - parseISO(b.fecha_caducidad!).getTime();
    } catch {
      return 0;
    }
  })[0]?.fecha_caducidad || null;
}
