import { Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTimeLog } from "@/context/TimeLogContext";
import { useStore } from "@/context/StoreContext";

export function DashboardJornada() {
  const { logs } = useTimeLog();
  const { store } = useStore();
  
  // Encontrar logs de hoy
  const todayStr = new Date().toISOString().slice(0, 10);
  const storeId = store === "Sur" ? 2 : 1;
  
  const todayLogs = logs.filter(l => {
    const isToday = l.created_at.startsWith(todayStr);
    const isStore = store === "Ambas" ? true : l.tienda_id === storeId;
    return isToday && isStore;
  });

  const entrada = todayLogs.find(l => l.tipo === "entrada");
  const salida = todayLogs.find(l => l.tipo === "salida" && entrada && new Date(l.created_at) > new Date(entrada.created_at));

  let estado: "Sin registrar" | "Activa" | "Completada" = "Sin registrar";
  if (entrada && salida) estado = "Completada";
  else if (entrada) estado = "Activa";

  const getBadgeStyle = () => {
    if (estado === "Activa" || estado === "Completada") return "bg-[#EAF3DE] text-[#3B6D11] dark:bg-emerald-900/30 dark:text-emerald-400";
    return "bg-[#F3F4F6] text-[#6B7280] dark:bg-slate-800 dark:text-slate-400";
  };

  const getEntradaLabel = () => {
    if (!entrada) return "";
    const d = new Date(entrada.created_at);
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  const getSalidaLabel = () => {
    if (salida) {
      const d = new Date(salida.created_at);
      return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    }

    if (estado === "Activa" && entrada) {
      // Calculate expected exit time based on day of week
      const d = new Date(entrada.created_at);
      const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      
      let expectedHour = 18; // Default
      if (day === 1) expectedHour = 18; // Lunes 9-18
      else if (day === 2) expectedHour = 17; // Martes 9-17
      else if (day === 3) expectedHour = 19; // Miercoles 10-19
      else if (day === 4) expectedHour = 16; // Jueves 10-16
      else if (day === 5) expectedHour = 16; // Viernes 9-16
      else if (day === 6) expectedHour = 13; // Sabado 8-13
      
      // We don't have Sunday, assume no work or default 12
      if (day === 0) expectedHour = 12;

      // format as hour string "18:00"
      return `${expectedHour.toString().padStart(2, '0')}:00`;
    }

    return "—";
  };

  const getWorkedHours = () => {
    if (!entrada || !salida) return null;
    const diffMs = new Date(salida.created_at).getTime() - new Date(entrada.created_at).getTime();
    const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);
    return `${hours} horas trabajadas`;
  };

  const getPassedHoursText = () => {
    if (!entrada) return "";
    const diffMs = new Date().getTime() - new Date(entrada.created_at).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    return `hace ${hours} h`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] overflow-hidden shadow-sm">
      <div className="flex justify-between items-center p-[12px_14px] border-b-[0.5px] border-[#F3F4F6] dark:border-slate-800">
        <div className="flex items-center gap-[8px]">
          <Clock size={16} color="#1C4A2E" className="dark:text-emerald-500" />
          <h3 className="font-sans text-[13px] font-semibold text-[#111827] dark:text-slate-100">
            Jornada de hoy
          </h3>
          <span className={`font-sans text-[10px] font-medium rounded-full px-[8px] py-[2px] ${getBadgeStyle()}`}>
            {estado}
          </span>
        </div>
        <Link to="/horarios" className="font-sans text-[11px] text-[#1C4A2E] dark:text-emerald-400 cursor-pointer hover:underline">
          Ver historial →
        </Link>
      </div>

      {estado === "Sin registrar" && (
        <div className="p-[20px] text-center flex flex-col items-center gap-[8px]">
          <p className="font-sans text-[13px] text-[#6B7280] dark:text-slate-400 m-0">
            No has registrado tu entrada de hoy
          </p>
          <Link to="/horarios">
            <button className="bg-[#1C4A2E] dark:bg-emerald-600 hover:bg-[#1C4A2E]/90 text-white rounded-[8px] p-[10px_24px] font-sans text-[14px] font-medium transition-colors cursor-pointer">
              Registrar entrada →
            </button>
          </Link>
        </div>
      )}

      {(estado === "Activa" || estado === "Completada") && (
        <div className="p-[16px_20px] flex flex-row items-center gap-[16px]">
          <div className="text-center w-[80px]">
            <p className="font-sans text-[10px] text-[#9CA3AF] m-0">Entrada</p>
            <p className="font-mono-data text-[22px] font-semibold text-[#111827] dark:text-slate-100 m-0">
              {getEntradaLabel()}
            </p>
            <p className="font-sans text-[10px] text-[#9CA3AF] m-0">
              {getPassedHoursText()}
            </p>
          </div>

          <div className="flex-1 flex items-center h-[2px] bg-[#F3F4F6] dark:bg-slate-800 relative rounded-full mx-4">
            <div className="absolute left-0 top-0 bottom-0 bg-[#EAF3DE] dark:bg-emerald-900" style={{ width: estado === "Completada" ? "100%" : "50%" }}></div>
            {estado === "Activa" && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-[#1C4A2E] dark:bg-emerald-500"></div>
            )}
            {estado === "Completada" && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-sans text-[10px] font-medium px-2 py-0.5 bg-[#EAF3DE] text-[#3B6D11] dark:bg-emerald-900/50 dark:text-emerald-400 rounded-full whitespace-nowrap">
                {getWorkedHours()}
              </div>
            )}
          </div>

          <div className={`text-center w-[80px] ${estado === "Activa" ? "opacity-40" : ""}`}>
            <p className="font-sans text-[10px] text-[#9CA3AF] m-0">
              {estado === "Activa" ? "Salida esperada" : "Salida"}
            </p>
            <p className={`font-mono-data text-[22px] font-semibold m-0 ${estado === "Completada" ? "text-[#111827] dark:text-slate-100" : "text-[#9CA3AF]"}`}>
              {getSalidaLabel()}
            </p>
          </div>

          {estado === "Activa" && (
            <div className="flex flex-col items-center gap-[4px] ml-[12px]">
              <Link to="/horarios">
                <button className="bg-[#F3F4F6] dark:bg-slate-800 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 text-[#374151] dark:text-slate-300 rounded-[8px] p-[8px_16px] font-sans text-[13px] font-medium transition-colors cursor-pointer">
                  Registrar salida
                </button>
              </Link>
              <span className="font-sans text-[10px] text-[#9CA3AF]">
                {store === "Ambas" ? "Norte/Sur" : store}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
