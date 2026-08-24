import { TrendingUp, PackageOpen, AlertOctagon, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReportsKpiGridProps {
  stylePreset?: string;
  loadingSales: boolean;
  totalUnits: number;
  range: string;
  topCategory: string;
  totalMermasUnits: number;
  mermasCount: number;
  criticosCount: number;
  onNavigateCategory: (cat: string) => void;
  onNavigateStatus: (status: string) => void;
}

export function ReportsKpiGrid({
  stylePreset,
  loadingSales,
  totalUnits,
  range,
  topCategory,
  totalMermasUnits,
  mermasCount,
  criticosCount,
  onNavigateCategory,
  onNavigateStatus,
}: ReportsKpiGridProps) {
  if (stylePreset === "obsidian") {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-border dark:border-primary/5 divide-x divide-y lg:divide-y-0 divide-border dark:divide-primary/5 bg-card/30 dark:bg-slate-900/30 rounded-[3px] overflow-hidden dark:backdrop-blur-[12px] dark:backdrop-saturate-[140%]">
        {/* Total vendidos */}
        <div 
          onClick={() => document.getElementById('registro-ventas')?.scrollIntoView({ behavior: 'smooth' })}
          className="block outline-none hover:bg-muted/40 dark:hover:bg-primary/3 transition-all duration-300 p-[20px_16px] cursor-pointer text-left"
        >
          <div className="flex flex-col h-full justify-between gap-3 text-left">
            <div className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 inline-block animate-pulse" />
              [01 // TOTAL VENDIDOS]
            </div>
            <div>
              <div className="font-sans text-3xl md:text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight leading-none">
                {loadingSales ? "-" : totalUnits} <span className="text-[14px] font-bold text-slate-450 dark:text-slate-500">uds</span>
              </div>
            </div>
            <div className="font-sans text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              LOG RANGE: {range.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Categoría Estrella */}
        <div 
          onClick={() => onNavigateCategory(topCategory)}
          className="block outline-none hover:bg-muted/40 dark:hover:bg-primary/3 transition-all duration-300 p-[20px_16px] cursor-pointer text-left"
        >
          <div className="flex flex-col h-full justify-between gap-3 text-left">
            <div className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-none bg-primary inline-block" />
              [02 // CATEGORÍA TOP]
            </div>
            <div>
              <div className="font-sans text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none truncate">
                {loadingSales ? "-" : topCategory}
              </div>
            </div>
            <div className="font-sans text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              TOP_PERFORMING_PATH
            </div>
          </div>
        </div>

        {/* Mermas / Pérdidas */}
        <div 
          onClick={() => document.getElementById('registro-mermas')?.scrollIntoView({ behavior: 'smooth' })}
          className="block outline-none hover:bg-muted/40 dark:hover:bg-primary/3 transition-all duration-300 p-[20px_16px] cursor-pointer text-left"
        >
          <div className="flex flex-col h-full justify-between gap-3 text-left">
            <div className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-none bg-red-500 inline-block" />
              [03 // PÉRDIDAS & MERMAS]
            </div>
            <div>
              <div className="font-sans text-3xl md:text-4xl font-black text-red-600 dark:text-red-400 tracking-tight leading-none">
                {totalMermasUnits} <span className="text-[14px] font-bold text-slate-450 dark:text-slate-500">uds</span>
              </div>
            </div>
            <div className="font-sans text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
              {mermasCount} REGISTROS FÍSICOS
            </div>
          </div>
        </div>

        {/* Lotes Críticos */}
        <div 
          onClick={() => onNavigateStatus('vencido')}
          className="block outline-none hover:bg-muted/40 dark:hover:bg-primary/3 transition-all duration-300 p-[20px_16px] cursor-pointer text-left"
        >
          <div className="flex flex-col h-full justify-between gap-3 text-left">
            <div className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-none inline-block ${criticosCount > 0 ? "bg-amber-500 animate-ping" : "bg-primary"}`} />
              [04 // LOTES CRÍTICOS]
            </div>
            <div>
              <div className="font-sans text-3xl md:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight leading-none">
                {criticosCount} <span className="text-[14px] font-bold text-slate-450 dark:text-slate-500">alertas</span>
              </div>
            </div>
            <div className="font-sans text-[11px] font-bold uppercase tracking-wider">
              {criticosCount > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">PRÓXIMOS/VENCIDOS</span>
              ) : (
                <span className="text-slate-450 dark:text-slate-500">SYS: OPERATIONAL</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px]">
      <Card 
        className="p-[16px_20px] rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all flex flex-col justify-between h-[100px] cursor-pointer hover:shadow-md hover:-translate-y-0.5"
        onClick={() => document.getElementById('registro-ventas')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="flex items-center gap-[12px]">
          <div className="w-[32px] h-[32px] rounded-[6px] bg-[#EAF3DE] dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-[#1C4A2E] dark:text-emerald-400" />
          </div>
          <p className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium text-[#9CA3AF]">Total Vendidos</p>
        </div>
        <h4 className="font-mono-data text-[24px] font-semibold text-[#111827] dark:text-slate-50 mt-auto">
          {loadingSales ? "-" : totalUnits} <span className="font-sans text-[14px] text-[#6B7280] font-normal">uds</span>
        </h4>
      </Card>
      
      <Card 
        className="p-[16px_20px] rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all flex flex-col justify-between h-[100px] cursor-pointer hover:shadow-md hover:-translate-y-0.5"
        onClick={() => onNavigateCategory(topCategory)}
      >
        <div className="flex items-center gap-[12px]">
          <div className="w-[32px] h-[32px] rounded-[6px] bg-[#EAF3DE] dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <PackageOpen size={16} className="text-[#1C4A2E] dark:text-emerald-400" />
          </div>
          <p className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium text-[#9CA3AF]">Categoría Top</p>
        </div>
        <h4 className="font-sans text-[18px] font-semibold text-[#111827] dark:text-slate-50 mt-auto truncate">
          {loadingSales ? "-" : topCategory}
        </h4>
      </Card>

      <Card 
        className="p-[16px_20px] rounded-[10px] border-[0.5px] border-red-200 dark:border-red-950/50 bg-white dark:bg-slate-900 shadow-sm transition-all flex flex-col justify-between h-[100px] cursor-pointer hover:shadow-md hover:-translate-y-0.5"
        onClick={() => document.getElementById('registro-mermas')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="flex items-center gap-[12px]">
          <div className="w-[32px] h-[32px] rounded-[6px] bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
            <AlertOctagon size={16} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium text-[#9CA3AF]">Pérdidas & Mermas</p>
        </div>
        <h4 className="font-mono-data text-[24px] font-semibold text-red-600 dark:text-red-400 mt-auto">
          -{totalMermasUnits} <span className="font-sans text-[14px] text-[#6B7280] font-normal">uds</span>
        </h4>
      </Card>

      <Card 
        className="p-[16px_20px] rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all flex flex-col justify-between h-[100px] cursor-pointer hover:shadow-md hover:-translate-y-0.5"
        onClick={() => onNavigateStatus('vencido')}
      >
        <div className="flex items-center gap-[12px]">
          <div className="w-[32px] h-[32px] rounded-[6px] bg-[#FCEBEB] dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-[#A32D2D] dark:text-red-400" />
          </div>
          <p className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium text-[#9CA3AF]">Lotes Críticos</p>
        </div>
        <h4 className="font-mono-data text-[24px] font-semibold text-[#A32D2D] dark:text-red-400 mt-auto">
          {criticosCount} <span className="font-sans text-[14px] text-[#A32D2D]/70 font-normal">alertas</span>
        </h4>
      </Card>
    </div>
  );
}
