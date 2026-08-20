import { Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTimeLog } from "@/context/TimeLogContext";
import { useStore } from "@/context/StoreContext";
import { useEffect, useState } from "react";
import { useProfile } from "@/context/ProfileContext";

export function DashboardJornada() {
  const { logs } = useTimeLog();
  const { store } = useStore();
  const { profile } = useProfile();
  
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);
  
  // Encontrar logs de hoy
  const todayStr = now.toISOString().slice(0, 10);
  const storeId = store === "Sur" ? 2 : store === "Centro" ? 3 : 1;
  
  const todayLogs = logs.filter(l => {
    const isToday = l.created_at.startsWith(todayStr);
    const isStore = (store === "Ambas" || store === "Todas") ? true : l.tienda_id === storeId;
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

  const getExpectedExitDate = () => {
    if (!entrada) return null;
    const d = new Date(entrada.created_at);
    const day = d.getDay(); 
    
    let expectedHour = 18;
    if (day === 1) expectedHour = 18;
    else if (day === 2) expectedHour = 17;
    else if (day === 3) expectedHour = 19;
    else if (day === 4) expectedHour = 16;
    else if (day === 5) expectedHour = 16;
    else if (day === 6) expectedHour = 13;
    else if (day === 0) expectedHour = 12;

    const expectedDate = new Date(d);
    expectedDate.setHours(expectedHour, 0, 0, 0);
    return expectedDate;
  };

  const getSalidaLabel = () => {
    if (salida) {
      const d = new Date(salida.created_at);
      return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    }

    if (estado === "Activa" && entrada) {
      const expected = getExpectedExitDate();
      if (expected) {
        return expected.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      }
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
    const diffMs = now.getTime() - new Date(entrada.created_at).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    return `hace ${hours} h`;
  };

  const getProgressPercentage = () => {
    if (estado === "Completada") return 100;
    if (estado !== "Activa" || !entrada) return 0;
    
    const startMs = new Date(entrada.created_at).getTime();
    const expected = getExpectedExitDate();
    if (!expected) return 50;

    const endMs = expected.getTime();
    const currentMs = now.getTime();
    
    if (currentMs >= endMs) return 100;
    if (currentMs <= startMs) return 0;

    const totalMs = endMs - startMs;
    const elapsedMs = currentMs - startMs;
    const percentage = (elapsedMs / totalMs) * 100;
    
    return Math.min(100, Math.max(0, percentage));
  };

  const progress = getProgressPercentage();
  const isPremium = profile.stylePreset === "obsidian";

  if (isPremium) {
    return (
      <div className="border border-border dark:border-primary/6 rounded-[3px] bg-card/30 dark:bg-slate-900/30 overflow-hidden shadow-sm flex flex-col dark:backdrop-blur-[12px] dark:backdrop-saturate-[140%] dark:shadow-[inset_0_0.5px_0_oklch(0.82_0.16_160/4%)]">
        <div className="flex justify-between items-center p-[12px_14px] border-b border-border dark:border-primary/6 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary dark:text-emerald-400 animate-pulse" />
            <h3 className="font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-wider">
              SHIFT LOG
            </h3>
            <span className={`font-mono text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-[2px] border ${
              estado === "Completada" 
                ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" 
                : estado === "Activa" 
                ? "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/5 animate-pulse" 
                : "border-slate-500/20 text-muted-foreground bg-muted/40"
            }`}>
              {estado === "Sin registrar" ? "OFFLINE" : estado === "Activa" ? "ACTIVE" : "COMPLETED"}
            </span>
          </div>
          <Link to="/horarios" className="font-mono text-[10px] text-primary dark:text-emerald-400 cursor-pointer hover:underline transition-all duration-300">
            HISTORIAL →
          </Link>
        </div>

        {estado === "Sin registrar" && (
          <div className="p-6 text-center flex flex-col items-center gap-3">
            <p className="font-mono text-[11px] text-muted-foreground uppercase">
              SIN REGISTRO DE JORNADA HOY
            </p>
            <Link to="/horarios">
              <button className="bg-primary hover:bg-primary/95 text-primary-foreground font-mono text-[10px] font-bold tracking-wider uppercase px-5 py-2.5 rounded-[2px] cursor-pointer transition-all duration-300 border border-primary/20 active:scale-[0.97]">
                REGISTRAR ENTRADA →
              </button>
            </Link>
          </div>
        )}

        {(estado === "Activa" || estado === "Completada") && (
          <div className="p-[16px_20px] flex flex-col lg:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-start">
              <div className="text-left font-mono">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">ENTRADA</p>
                <p className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 my-0.5 leading-none">
                  {getEntradaLabel()}
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">
                  {getPassedHoursText()}
                </p>
              </div>

              <div className="h-8 w-[1px] bg-border dark:bg-primary/6 hidden lg:block" />

              <div className={`text-left font-mono ${estado === "Activa" ? "opacity-60" : ""}`}>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                  {estado === "Activa" ? "SALIDA EST." : "SALIDA"}
                </p>
                <p className={`text-[20px] font-semibold my-0.5 leading-none ${estado === "Completada" ? "text-slate-900 dark:text-slate-100" : "text-muted-foreground"}`}>
                  {getSalidaLabel()}
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">
                  {estado === "Activa" ? "ESTIMADO" : "COMPLETADO"}
                </p>
              </div>
            </div>

            {/* High-fidelity linear gauge */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[8px] font-mono text-muted-foreground/60 uppercase tracking-wider">
                <span>0%</span>
                {estado === "Completada" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{getWorkedHours()}</span>
                ) : (
                  <span>{Math.round(progress)}% TRANSCURRIDO</span>
                )}
                <span>100%</span>
              </div>
              
              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-[2px] relative overflow-hidden">
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-primary/40 dark:bg-emerald-500/40 transition-all duration-1000 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
                {estado === "Activa" && (
                  <div 
                    className="absolute top-0 bottom-0 w-2 bg-primary dark:bg-emerald-400 animate-pulse transition-all duration-1000 ease-in-out" 
                    style={{ left: `calc(${progress}% - 4px)` }}
                  />
                )}
              </div>
            </div>

            {estado === "Activa" && (
              <div className="flex flex-col items-end gap-1 shrink-0 w-full lg:w-auto">
                <Link to="/horarios" className="w-full lg:w-auto">
                  <button className="w-full lg:w-auto bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-[2px] border border-border transition-all duration-300 cursor-pointer whitespace-nowrap active:scale-[0.97]">
                    REGISTRAR SALIDA
                  </button>
                </Link>
                <span className="font-mono text-[9px] text-muted-foreground/70 uppercase hidden lg:inline">
                  {store === "Ambas" ? "MNG/BCG" : store}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

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

          <div className="flex-1 flex items-center h-[4px] bg-[#F3F4F6] dark:bg-slate-800 relative rounded-full mx-4">
            <div className="absolute left-0 top-0 bottom-0 bg-[#EAF3DE] dark:bg-emerald-900 transition-all duration-1000 ease-in-out rounded-full" style={{ width: `${progress}%` }}></div>
            {estado === "Activa" && (
              <div 
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-[#1C4A2E] dark:bg-emerald-500 shadow-sm transition-all duration-1000 ease-in-out" 
                style={{ left: `${progress}%` }}
              ></div>
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
                <button className="bg-[#F3F4F6] dark:bg-slate-800 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 text-[#374151] dark:text-slate-300 rounded-[8px] p-[8px_16px] font-sans text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap">
                  Registrar salida
                </button>
              </Link>
              <span className="font-sans text-[10px] text-[#9CA3AF]">
                {store === "Ambas" || store === "Todas" ? "Todas las sedes" : store}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
