import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type ExpiryStatus = "vencido" | "proximo" | "en_regla";

export function getDaysUntilExpiry(fecha: string): number {
  return differenceInCalendarDays(parseISO(fecha), new Date());
}

export function getExpiryStatus(fecha: string): ExpiryStatus {
  const days = getDaysUntilExpiry(fecha);
  if (days < 0) return "vencido";
  if (days <= 30) return "proximo";
  return "en_regla";
}

export function formatExpiryDate(fecha: string): string {
  return format(parseISO(fecha), "dd MMM yyyy", { locale: es });
}
