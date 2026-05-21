import type { StoreId } from "./inventory";

export type TimeLogType = "entrada" | "salida";

export interface TimeLogEntry {
  id: string;
  timestamp: string; // ISO
  tipo: TimeLogType;
  tienda: StoreId;
}
