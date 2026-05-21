import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Visita } from "@/types/inventory";
import { supabase } from "@/lib/supabase";

interface VisitContextValue {
  visitas: Visita[];
  loading: boolean;
  registrarVisita: (tienda_id: number, fecha: string, notas?: string) => Promise<void>;
  refreshVisitas: () => Promise<void>;
}

const VisitContext = createContext<VisitContextValue | null>(null);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visitas")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setVisitas(data || []);
    } catch (err) {
      console.error("Error fetching visitas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitas();
  }, [fetchVisitas]);

  const registrarVisita = async (tienda_id: number, fecha: string, notas?: string) => {
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
