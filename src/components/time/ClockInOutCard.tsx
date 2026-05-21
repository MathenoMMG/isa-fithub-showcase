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
    .filter((l) => isToday(parseISO(l.timestamp)))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const last = todayLogs[todayLogs.length - 1];
  const canEntrar = !last || last.tipo === "salida";
  const canSalir = last?.tipo === "entrada";

  const tienda = store === "Ambas" ? "Sur" : store;

  const handle = (tipo: "entrada" | "salida") => {
    addLog(tipo, tienda);
    toast.success(`${tipo === "entrada" ? "Entrada" : "Salida"} registrada en ${tienda}`);
  };

  return (
    <Card className="p-6 md:p-8 rounded-2xl border-slate-200 bg-white shadow-sm">
      <div className="text-center mb-6">
        <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">{format(now, "EEEE d 'de' MMMM", { locale: es })}</div>
        <div className="text-5xl md:text-6xl font-bold text-slate-900 tabular-nums mt-2">{format(now, "HH:mm:ss")}</div>
        <div className="text-sm text-slate-500 mt-2">
          Tienda activa: <span className="font-semibold text-emerald-700">{tienda}</span>
          {store === "Ambas" && <span className="text-slate-400"> (por defecto Sur)</span>}
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
          className="h-20 text-lg font-bold rounded-2xl bg-slate-800 hover:bg-slate-900 text-white gap-3 disabled:opacity-40"
        >
          <LogOut className="h-6 w-6" />
          Registrar Salida
        </Button>
      </div>

      {todayLogs.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Eventos de hoy</h3>
          <ul className="space-y-2">
            {todayLogs.map((l) => (
              <li key={l.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                <span className="flex items-center gap-2">
                  {l.tipo === "entrada" ? (
                    <LogIn className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <LogOut className="h-4 w-4 text-slate-700" />
                  )}
                  <span className="font-medium capitalize">{l.tipo}</span>
                  <span className="text-slate-500">· {l.tienda}</span>
                </span>
                <span className="tabular-nums text-slate-700 font-medium">{format(parseISO(l.timestamp), "HH:mm:ss")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
