import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { RegistroHorario, StoreId } from "@/types/inventory";
import { supabase } from "@/lib/supabase";
import { useStore } from "./StoreContext";

interface TimeLogContextValue {
  logs: RegistroHorario[];
  loading: boolean;
  addLog: (tipo: "entrada" | "salida", tienda_id: number | null) => Promise<void>;
  refreshLogs: () => Promise<void>;
}

const TimeLogContext = createContext<TimeLogContextValue | null>(null);

export function TimeLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<RegistroHorario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("registros_horario")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching time logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = async (tipo: "entrada" | "salida", tienda_id: number | null) => {
    const { error } = await supabase.from("registros_horario").insert({
      tipo,
      tienda_id,
    });
    if (error) throw error;
    await fetchLogs();
  };

  return (
    <TimeLogContext.Provider
      value={{
        logs,
        loading,
        addLog,
        refreshLogs: fetchLogs,
      }}
    >
      {children}
    </TimeLogContext.Provider>
  );
}

export function useTimeLog() {
  const ctx = useContext(TimeLogContext);
  if (!ctx) throw new Error("useTimeLog must be used within TimeLogProvider");
  return ctx;
}
