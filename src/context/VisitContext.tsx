import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Visita } from "@/types/inventory";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { addPendingOp } from "@/lib/offline";
import { toast } from "sonner";

interface VisitContextValue {
  visitas: Visita[];
  loading: boolean;
  registrarVisita: (tienda_id: number, fecha: string, notas?: string) => Promise<void>;
  addVisita?: (tienda_id: number, comentario: string) => Promise<void>;
  refreshVisitas: () => Promise<void>;
}

const VisitContext = createContext<VisitContextValue | null>(null);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchVisitas = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .not("id", "like", "00000000-0000-0000-0000-%")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setVisitas(data || []);
    } catch (err) {
      console.error("Error fetching visitas:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setVisitas([]);
      setLoading(false);
      return;
    }

    // Carga inicial
    fetchVisitas(true);

    // Polling silencioso cada 15 segundos para mantener visitas sincronizadas
    const interval = setInterval(() => {
      fetchVisitas(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchVisitas, isAuthenticated]);

  const registrarVisita = async (tienda_id: number, fecha: string, notas?: string) => {
    try {
      if (!window.navigator.onLine) {
        throw new Error("offline");
      }
      const { error } = await supabase.from("visitas").insert({
        tienda_id,
        fecha,
        notas: notas || null,
      });
      
      // Ignorar el error de duplicado (si la impulsadora ya marcó visita este día para esta tienda)
      // El índice UNIQUE(tienda_id, fecha) protege esto en BD.
      if (error && error.code !== "23505") { 
        throw error;
      }
      
      await fetchVisitas();
    } catch (err) {
      console.warn("Error registering visit, saving offline:", err);
      addPendingOp('visit', { tienda_id, fecha, notas });
      toast.warning("Sin conexión: Visita registrada localmente en cola.");
      
      // Optimistic UI Update
      const fakeVisit: Visita = {
        id: Math.random().toString(36).substring(2, 9),
        tienda_id,
        fecha,
        notas: notas || null,
        created_at: new Date().toISOString()
      };
      setVisitas(prev => [fakeVisit, ...prev]);
    }
  };

  return (
    <VisitContext.Provider
      value={{
        visitas,
        loading,
        registrarVisita,
        refreshVisitas: fetchVisitas,
      }}
    >
      {children}
    </VisitContext.Provider>
  );
}

export function useVisitas() {
  const ctx = useContext(VisitContext);
  if (!ctx) throw new Error("useVisitas must be used within VisitProvider");
  return ctx;
}
