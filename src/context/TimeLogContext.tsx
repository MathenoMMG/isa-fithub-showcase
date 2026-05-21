import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { TimeLogEntry, TimeLogType } from "@/types/time";
import type { StoreId } from "@/types/inventory";

interface TimeLogContextValue {
  logs: TimeLogEntry[];
  addLog: (tipo: TimeLogType, tienda: StoreId) => void;
  clearLogs: () => void;
}

const TimeLogContext = createContext<TimeLogContextValue | null>(null);
const STORAGE_KEY = "fithub.timelogs";

export function TimeLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<TimeLogEntry[]>([]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  }, [logs]);

  const addLog = (tipo: TimeLogType, tienda: StoreId) => {
    setLogs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), timestamp: new Date().toISOString(), tipo, tienda },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  return <TimeLogContext.Provider value={{ logs, addLog, clearLogs }}>{children}</TimeLogContext.Provider>;
}

export function useTimeLog() {
  const ctx = useContext(TimeLogContext);
  if (!ctx) throw new Error("useTimeLog must be used within TimeLogProvider");
  return ctx;
}
