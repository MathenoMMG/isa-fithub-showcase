import { Activity, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTimeLog } from "@/context/TimeLogContext";

export function DashboardActivity() {
  const { logs } = useTimeLog();

  const recentLogs = logs.slice(0, 5);

  const getPassedText = (dateIso: string) => {
    const diffMs = new Date().getTime() - new Date(dateIso).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `hace ${days} d`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] overflow-hidden shadow-sm">
      <div className="flex justify-between items-center p-[12px_14px] border-b-[0.5px] border-[#F3F4F6] dark:border-slate-800">
        <h3 className="font-sans text-[13px] font-semibold text-[#111827] dark:text-slate-100">
          Actividad reciente
        </h3>
        <Link to="/horarios" className="font-sans text-[11px] text-[#1C4A2E] dark:text-emerald-400 cursor-pointer hover:underline">
          Todo →
        </Link>
      </div>

      {recentLogs.length > 0 ? (
        <div>
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-[10px] p-[9px_14px] border-b-[0.5px] border-[#F9FAFB] dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="w-[28px] h-[28px] rounded-[6px] bg-[#EAF3DE] dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Clock size={14} color="#1C4A2E" className="dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-[13px] text-[#374151] dark:text-slate-300 truncate">
                  Registro de {log.tipo}
                </div>
                <div className="font-sans text-[11px] text-[#9CA3AF] mt-[1px]">
                  {getPassedText(log.created_at)}
                </div>
              </div>
              <div className="shrink-0 font-sans text-[9px] bg-[#F3F4F6] text-[#6B7280] dark:bg-slate-800 dark:text-slate-400 px-[7px] py-[2px] rounded-full">
                {log.tienda_id === 1 ? "BCG" : log.tienda_id === 2 ? "MNG" : log.tienda_id === 3 ? "GTS" : "—"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-[24px] text-center flex flex-col items-center justify-center">
          <Activity size={32} color="#D1D5DB" className="mb-2" />
          <div className="font-sans text-[12px] text-[#9CA3AF]">Sin actividad registrada aún</div>
        </div>
      )}
    </div>
  );
}
