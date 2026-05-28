import { format as fnsFormat, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Retorna un objeto Date local cuyas horas, minutos, año y día
 * corresponden exactamente a los valores de la hora en Colombia (America/Bogota).
 */
export function getBogotaDate(date: Date | string = new Date()): Date {
  const d = typeof date === "string" ? parseISO(date) : date;

  // Utilizar Intl para obtener los componentes de fecha exactos de Bogotá
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  try {
    const parts = formatter.formatToParts(d);
    const getPart = (type: string) => {
      const p = parts.find((part) => part.type === type);
      return p ? parseInt(p.value, 10) : 0;
    };

    return new Date(
      getPart("year"),
      getPart("month") - 1,
      getPart("day"),
      getPart("hour"),
      getPart("minute"),
      getPart("second")
    );
  } catch (err) {
    console.error("Error formatting Bogota date, falling back to local date:", err);
    return d;
  }
}

/**
 * Formatea una fecha o cadena ISO asegurando que los valores correspondan
 * a la zona horaria de Colombia (America/Bogota).
 */
export function formatInBogota(date: Date | string, formatStr: string): string {
  const bogotaDate = getBogotaDate(date);
  return fnsFormat(bogotaDate, formatStr, { locale: es });
}

/**
 * Evalúa si una cadena ISO o fecha corresponde al día de hoy en Bogotá.
 */
export function isTodayInBogota(date: Date | string): boolean {
  const nowBogota = getBogotaDate(new Date());
  const targetBogota = getBogotaDate(date);
  
  return (
    nowBogota.getFullYear() === targetBogota.getFullYear() &&
    nowBogota.getMonth() === targetBogota.getMonth() &&
    nowBogota.getDate() === targetBogota.getDate()
  );
}

/**
 * Compara si dos fechas corresponden al mismo día en la zona horaria de Bogotá.
 */
export function isSameDayInBogota(date1: Date | string, date2: Date | string): boolean {
  const d1 = getBogotaDate(date1);
  const d2 = getBogotaDate(date2);
  
  return isSameDay(d1, d2);
}
