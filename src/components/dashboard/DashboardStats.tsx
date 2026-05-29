import { Link } from "@tanstack/react-router";
import { useInventory } from "@/context/InventoryContext";
import { countLotesByStatus } from "@/lib/expiry";
import { useProfile } from "@/context/ProfileContext";

export function DashboardStats() {
  const { filteredItems } = useInventory();
  const { profile } = useProfile();
  
  const allLotes = filteredItems.flatMap((i) => i.lotes);
  const { proximos, vencidos } = countLotesByStatus(allLotes);

  // Vigentes: total lotes - proximos - vencidos
  const vigentes = allLotes.length - proximos - vencidos;
  
  const isPremium = profile.stylePreset === "obsidian";

  if (isPremium) {
    return (
      <div className="grid grid-cols-3 border border-border dark:border-primary/5 divide-x divide-border dark:divide-primary/5 bg-card/30 dark:bg-slate-900/30 rounded-[3px] overflow-hidden dark:backdrop-blur-[12px] dark:backdrop-saturate-[140%] dark:shadow-[inset_0_0.5px_0_oklch(0.82_0.16_160/4%)]">
        {/* Vigentes */}
        <Link to="/inventario" className="block outline-none hover:bg-muted/40 dark:hover:bg-primary/3 transition-all duration-300 p-6">
          <div className="flex flex-col h-full justify-between gap-4 text-left">
            <div className="font-sans text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 inline-block animate-pulse" />
              PRODUCTOS VIGENTES
            </div>
            <div>
              <div className="font-serif-preset font-serif text-5xl font-black text-emerald-700 dark:text-emerald-400 leading-none">
                {vigentes}
              </div>
            </div>
            <div className="font-sans text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              SISTEMA: NOMINAL
            </div>
          </div>
        </Link>

        {/* Próximos */}
        <Link to="/inventario" className="block outline-none hover:bg-muted/40 dark:hover:bg-primary/3 transition-all duration-300 p-6">
          <div className="flex flex-col h-full justify-between gap-4 text-left">
            <div className="font-sans text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-amber-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-none bg-amber-500 inline-block" />
              PRÓXIMOS A VENCER
            </div>
            <div>
              <div className="font-serif-preset font-serif text-5xl font-black text-amber-700 dark:text-amber-400 leading-none">
                {proximos}
              </div>
            </div>
            <div className="font-sans text-[11px] font-semibold text-amber-700/80 dark:text-amber-400/80 uppercase tracking-wider">
              LIMITE: ≤ 30 DÍAS
            </div>
          </div>
        </Link>

        {/* Vencidos */}
        <Link to="/inventario" className="block outline-none hover:bg-muted/40 dark:hover:bg-primary/3 transition-all duration-300 p-6">
          <div className="flex flex-col h-full justify-between gap-4 text-left">
            <div className="font-sans text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-red-500 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-none inline-block ${vencidos > 0 ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
              LOTES VENCIDOS
            </div>
            <div>
              <div className="font-serif-preset font-serif text-5xl font-black text-red-600 dark:text-red-400 leading-none">
                {vencidos}
              </div>
            </div>
            <div className="font-sans text-[11px] uppercase tracking-wider font-semibold">
              {vencidos > 0 ? (
                <span className="text-red-600 dark:text-red-400 font-extrabold animate-pulse">ALERTA: DISPONER HOY</span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">SYS: SIN ALERTAS</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-[10px]">
      {/* Card 1 — Vigentes */}
      <Link to="/inventario" className="block outline-none">
        <div className="bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] p-[14px_12px] text-center border-t-[3px] border-t-[#639922] cursor-pointer overflow-hidden transition-all hover:shadow-md h-full flex flex-col justify-between">
          <div className="font-sans text-[9px] uppercase tracking-[0.06em] text-[#9CA3AF]">
            Vigentes
          </div>
          <div className="font-mono-data text-[26px] font-semibold text-[#3B6D11] dark:text-[#639922] my-1">
            {vigentes}
          </div>
          <div className="flex justify-center">
            <span className="font-sans text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
              —
            </span>
          </div>
        </div>
      </Link>

      {/* Card 2 — Próximos a vencer */}
      <Link to="/inventario" className="block outline-none">
        <div className="bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] p-[14px_12px] text-center border-t-[3px] border-t-[#EF9F27] cursor-pointer overflow-hidden transition-all hover:shadow-md h-full flex flex-col justify-between">
          <div className="font-sans text-[9px] uppercase tracking-[0.06em] text-[#9CA3AF]">
            Próximos
          </div>
          <div className="font-mono-data text-[26px] font-semibold text-[#854F0B] dark:text-[#EF9F27] my-1">
            {proximos}
          </div>
          <div className="flex justify-center">
            <span className="font-sans text-[10px] bg-[#FAEEDA] text-[#854F0B] px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
              ≤ 30 días
            </span>
          </div>
        </div>
      </Link>

      {/* Card 3 — Vencidos */}
      <Link to="/inventario" className="block outline-none">
        <div className="bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] p-[14px_12px] text-center border-t-[3px] border-t-[#E24B4A] cursor-pointer overflow-hidden transition-all hover:shadow-md h-full flex flex-col justify-between">
          <div className="font-sans text-[9px] uppercase tracking-[0.06em] text-[#9CA3AF]">
            Vencidos
          </div>
          <div className="font-mono-data text-[26px] font-semibold text-[#A32D2D] dark:text-[#E24B4A] my-1">
            {vencidos}
          </div>
          <div className="flex justify-center">
            {vencidos > 0 ? (
              <span className="font-sans text-[10px] bg-[#FCEBEB] text-[#A32D2D] px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
                Retirar hoy
              </span>
            ) : (
              <span className="font-sans text-[10px] bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                ✓ Sin vencidos
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
