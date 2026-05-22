import { Link } from "@tanstack/react-router";
import { Plus, List, Download, BarChart2, ChevronRight, Clock } from "lucide-react";
import { useTimeLog } from "@/context/TimeLogContext";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function DashboardShortcuts() {
  const { logs, refreshLogs } = useTimeLog();
  const { store } = useStore();

  const storeId = store === "Sur" ? 2 : 1;
  const todayStr = new Date().toISOString().slice(0, 10);
  const hasEntrada = logs.some(l => l.created_at.startsWith(todayStr) && l.tienda_id === storeId && l.tipo === "entrada");

  const handleCheckInOut = async () => {
    if (store === "Ambas") {
      toast.error("Selecciona una tienda específica primero");
      return;
    }
    if (hasEntrada) {
      toast.info("Ya hay una entrada registrada hoy.");
      return;
    }

    const now = new Date();
    const day = now.getDay();
    let startHour = 9;
    let endHour = 18;
    
    if (day === 1) { startHour = 9; endHour = 18; }
    else if (day === 2) { startHour = 9; endHour = 17; }
    else if (day === 3) { startHour = 10; endHour = 19; }
    else if (day === 4) { startHour = 10; endHour = 16; }
    else if (day === 5) { startHour = 9; endHour = 16; }
    else if (day === 6) { startHour = 8; endHour = 13; }
    else { 
      toast.error("Hoy no hay horario definido (Domingo).");
      return; 
    }

    const dStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, 0, 0);
    const dEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, 0, 0);

    try {
      const { error } = await supabase.from("registros_horario").insert([
        { tipo: "entrada", tienda_id: storeId, created_at: dStart.toISOString() },
        { tipo: "salida", tienda_id: storeId, created_at: dEnd.toISOString() }
      ]);
      
      if (error) throw error;
      
      await refreshLogs();
      toast.success(`Jornada completada automáticamente (${startHour}:00 - ${endHour}:00)`);
    } catch (e) {
      console.error(e);
      toast.error("Hubo un error al registrar el horario completo");
    }
  };

  const shortcuts = [
    {
      id: 1,
      icon: Plus,
      title: "Registrar producto",
      desc: "Ingresar producto nuevo",
      link: "/inventario",
    },
    {
      id: 2,
      icon: List,
      title: "Inventario rápido",
      desc: "Modo masivo de góndola",
      link: "/inventario",
    },
    {
      id: 3,
      icon: Download,
      title: "Exportar informe",
      desc: "Excel o PDF al instante",
      link: "/informes",
    },
    {
      id: 4,
      icon: BarChart2,
      title: "Ver analítica",
      desc: "Tendencias y comparativas",
      link: "/informes",
    },
    {
      id: 5,
      icon: Clock,
      title: "Chequear el día",
      desc: "Registro de jornada automática",
      action: handleCheckInOut,
      disabled: hasEntrada,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
      {shortcuts.map((s) => {
        const content = (
          <div className={`bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] p-[14px] flex items-center gap-[12px] cursor-pointer transition-colors duration-150 hover:border-[#1C4A2E] dark:hover:border-emerald-500 h-full text-left w-full outline-none ${s.disabled ? "opacity-50 grayscale pointer-events-none cursor-not-allowed" : ""}`}>
            <div className={`w-[36px] h-[36px] rounded-[8px] flex items-center justify-center shrink-0 ${s.disabled ? "bg-slate-100 dark:bg-slate-800" : "bg-[#EAF3DE] dark:bg-emerald-900/30"}`}>
              <s.icon size={18} color={s.disabled ? "#9CA3AF" : "#1C4A2E"} className={!s.disabled ? "dark:text-emerald-400" : ""} />
            </div>
            <div className="flex-1">
              <div className="font-sans text-[13px] font-semibold text-[#111827] dark:text-slate-100">
                {s.title}
              </div>
              <div className="font-sans text-[11px] text-[#9CA3AF] mt-[2px]">
                {s.desc}
              </div>
            </div>
            {!s.disabled && <ChevronRight size={16} color="#D1D5DB" className="shrink-0 transition-colors group-hover:text-[#1C4A2E] dark:group-hover:text-emerald-400" />}
          </div>
        );

        if (s.link) {
          return (
            <Link key={s.id} to={s.link} className={`block outline-none group ${s.disabled ? "pointer-events-none" : ""}`}>
              {content}
            </Link>
          );
        }

        return (
          <button key={s.id} onClick={s.action} disabled={s.disabled} className={`block outline-none group w-full ${s.disabled ? "cursor-not-allowed" : ""}`}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
