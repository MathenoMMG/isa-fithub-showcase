import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { RegistroHorario, StoreId } from "@/types/inventory";
import { supabase } from "@/lib/supabase";
import { useStore } from "./StoreContext";
import { addPendingOp } from "@/lib/offline";
import { toast } from "sonner";

interface TimeLogContextValue {
  logs: RegistroHorario[];
  loading: boolean;
  addLog: (tipo: "entrada" | "salida", tienda_id: number | null) => Promise<void>;
  updateLog: (id: string, newDateIso: string) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  refreshLogs: () => Promise<void>;
}

const TimeLogContext = createContext<TimeLogContextValue | null>(null);

export function TimeLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<RegistroHorario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial
    fetchLogs(true);

    // Polling silencioso cada 15 segundos para mantener registros sincronizados
    const interval = setInterval(() => {
      fetchLogs(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchLogs]);

  const addLog = async (tipo: "entrada" | "salida", tienda_id: number | null) => {
    try {
      if (!window.navigator.onLine) {
        throw new Error("offline");
      }
      const { error } = await supabase.from("registros_horario").insert({
        tipo,
        tienda_id,
      });
      if (error) throw error;
      await fetchLogs();
    } catch (err) {
      console.warn("Error adding time log, saving offline:", err);
      addPendingOp('add_log', { tipo, tienda_id });
      toast.warning("Sin conexión: Turno registrado localmente en cola.");
      
      // Optimistic UI Update
      const fakeLog: RegistroHorario = {
        id: Math.random().toString(36).substring(2, 9),
        tipo,
        tienda_id,
        created_at: new Date().toISOString()
      };
      setLogs(prev => [fakeLog, ...prev]);
    }
  };

  const updateLog = async (id: string, newDateIso: string) => {
    const { error } = await supabase.from("registros_horario").update({ created_at: newDateIso }).eq("id", id);
    if (error) throw error;
    await fetchLogs();
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase.from("registros_horario").delete().eq("id", id);
    if (error) throw error;
    await fetchLogs();
  };

  return (
    <TimeLogContext.Provider
      value={{
        logs,
        loading,
        addLog,
        updateLog,
        deleteLog,
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
