import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTimeLog } from "@/context/TimeLogContext";
import { useStore } from "@/context/StoreContext";
import { format, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ClockInOutCard() {
  const { logs, addLog } = useTimeLog();
  const { store } = useStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const todayLogs = logs
    .filter((l) => isToday(parseISO(l.created_at)))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const last = todayLogs[todayLogs.length - 1];
  const canEntrar = !last || last.tipo === "salida";
  const canSalir = last?.tipo === "entrada";

  const tiendaName = store === "Ambas" ? "Norte" : store;
  const tiendaId = tiendaName === "Sur" ? 2 : 1;

  const handle = (tipo: "entrada" | "salida") => {
    addLog(tipo, tiendaId);
    toast.success(`${tipo === "entrada" ? "Entrada" : "Salida"} registrada en ${tiendaName}`);
  };

  return (
    <Card className="p-6 md:p-8 rounded-2xl border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <div className="text-center mb-6">
        <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">{format(now, "EEEE d 'de' MMMM", { locale: es })}</div>
        <div className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-50 tabular-nums mt-2">{format(now, "HH:mm:ss")}</div>
        <div className="text-sm text-slate-500 mt-2">
          Tienda activa: <span className="font-semibold text-emerald-700 dark:text-emerald-500">{tiendaName}</span>
          {store === "Ambas" && <span className="text-slate-400"> (por defecto Norte)</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={() => handle("entrada")}
          disabled={!canEntrar}
          className="h-20 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white gap-3 disabled:opacity-40"
        >
          <LogIn className="h-6 w-6" />
          Registrar Entrada
        </Button>
        <Button
          onClick={() => handle("salida")}
          disabled={!canSalir}
          className="h-20 text-lg font-bold rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white gap-3 disabled:opacity-40"
        >
          <LogOut className="h-6 w-6" />
          Registrar Salida
        </Button>
      </div>

      {todayLogs.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Eventos de hoy</h3>
          <ul className="space-y-2">
            {todayLogs.map((l) => (
              <li key={l.id} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 transition-colors">
                <span className="flex items-center gap-2">
                  {l.tipo === "entrada" ? (
                    <LogIn className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <LogOut className="h-4 w-4 text-slate-700 dark:text-slate-400" />
                  )}
                  <span className="font-medium capitalize dark:text-slate-200">{l.tipo}</span>
                  <span className="text-slate-500">· {l.tienda_id === 2 ? "Sur" : "Norte"}</span>
                </span>
                <span className="tabular-nums text-slate-700 dark:text-slate-300 font-medium">{format(parseISO(l.created_at), "HH:mm:ss")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
