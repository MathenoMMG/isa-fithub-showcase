import { useEffect } from "react";
import { supabase } from "./supabase";

/**
 * FitHub Keep-Alive Heartbeat
 * Ejecuta una consulta ligera en segundo plano para registrar actividad activa en Supabase
 * y prevenir que el proyecto entre en suspensión por inactividad de 7 días.
 */
export function useKeepAlive() {
  useEffect(() => {
    let active = true;

    const pingSupabase = async () => {
      try {
        // Consulta 'HEAD' ultraligera a la base de datos (0 bytes de payload de datos)
        await supabase
          .from("productos")
          .select("id", { count: "exact", head: true })
          .limit(1);
      } catch (err) {
        // Silencioso para no generar ruido
      }
    };

    pingSupabase();

    // Enviar un pulso cada 10 minutos si la pestaña se mantiene abierta
    const interval = setInterval(pingSupabase, 10 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);
}
