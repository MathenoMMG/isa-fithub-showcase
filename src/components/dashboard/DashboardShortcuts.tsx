import { Link } from "@tanstack/react-router";
import { Plus, List, Download, BarChart2, ChevronRight } from "lucide-react";

export function DashboardShortcuts() {
  const shortcuts = [
    {
      id: 1,
      icon: Plus,
      title: "Registrar producto",
      desc: "Ingresar producto nuevo",
      link: "/inventario", // fallback to inventario to open modal or view
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
      {shortcuts.map((s) => (
        <Link key={s.id} to={s.link} className="block outline-none group">
          <div className="bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] p-[14px] flex items-center gap-[12px] cursor-pointer transition-colors duration-150 hover:border-[#1C4A2E] dark:hover:border-emerald-500 h-full">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#EAF3DE] dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <s.icon size={18} color="#1C4A2E" className="dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="font-sans text-[13px] font-semibold text-[#111827] dark:text-slate-100">
                {s.title}
              </div>
              <div className="font-sans text-[11px] text-[#9CA3AF] mt-[2px]">
                {s.desc}
              </div>
            </div>
            <ChevronRight size={16} color="#D1D5DB" className="shrink-0 transition-colors group-hover:text-[#1C4A2E] dark:group-hover:text-emerald-400" />
          </div>
        </Link>
      ))}
    </div>
  );
}
