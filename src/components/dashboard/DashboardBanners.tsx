import { AlertCircle, Clock, CheckCircle, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useInventory } from "@/context/InventoryContext";
import { countLotesByStatus, getExpiryStatus } from "@/lib/expiry";
import { useProfile } from "@/context/ProfileContext";

export function DashboardBanners() {
  const { filteredItems } = useInventory();
  const { profile } = useProfile();
  
  const allLotes = (filteredItems || []).flatMap((i) => i.lotes || []);
  const { proximos, vencidos } = countLotesByStatus(allLotes);

  // We need to find the name of the first expired or near-expiry product (with active stock)
  const vencidosItems = (filteredItems || []).filter(p => (p.lotes || []).some(l => {
    if (!l || !l.fecha_caducidad || l.cantidad <= 0) return false;
    return getExpiryStatus(l.fecha_caducidad) === "vencido";
  }));

  const proximosItems = (filteredItems || []).filter(p => (p.lotes || []).some(l => {
    if (!l || !l.fecha_caducidad || l.cantidad <= 0) return false;
    return getExpiryStatus(l.fecha_caducidad) === "proximo";
  }));

  const isPremium = profile.stylePreset === "obsidian";

  if (isPremium) {
    if (vencidos > 0) {
      const primerNombre = vencidosItems[0]?.nombre || "Producto";
      const masStr = vencidos > 1 ? `y ${vencidos - 1} más` : "";
      return (
        <Link to="/inventario" search={{ q: primerNombre }} className="block w-full">
          <div className="flex flex-row items-center gap-[10px] bg-red-500/4 dark:bg-red-500/8 border border-red-500/15 border-l-[3px] border-l-red-500 py-[12px] px-[16px] min-h-[52px] cursor-pointer hover:bg-red-500/8 dark:hover:bg-red-500/12 transition-all duration-300 rounded-[3px] active:scale-[0.97]">
            <AlertCircle size={14} className="text-red-600 dark:text-red-400 shrink-0" />
            <div className="flex-1 flex flex-col justify-center text-left">
              <span className="font-sans text-[12px] font-extrabold text-red-750 dark:text-red-400 uppercase tracking-wide">
                {vencidos} VENCIDOS — RETIRAR HOY
              </span>
              <span className="font-sans text-[11px] font-semibold text-red-600/95 dark:text-red-450 mt-0.5 uppercase tracking-wide">
                {primerNombre} {masStr}
              </span>
            </div>
            <ChevronRight size={14} className="text-red-500 shrink-0 opacity-60" />
          </div>
        </Link>
      );
    }

    if (proximos > 0) {
      const primerNombre = proximosItems[0]?.nombre || "Producto";
      const masStr = proximos > 1 ? `y ${proximos - 1} más` : "";
      return (
        <Link to="/inventario" search={{ q: primerNombre }} className="block w-full">
          <div className="flex flex-row items-center gap-[10px] bg-amber-500/4 dark:bg-amber-500/8 border border-amber-500/15 border-l-[3px] border-l-amber-500 py-[12px] px-[16px] min-h-[52px] cursor-pointer hover:bg-amber-500/8 dark:hover:bg-amber-500/12 transition-all duration-300 rounded-[3px] active:scale-[0.97]">
            <Clock size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1 flex flex-col justify-center text-left">
              <span className="font-sans text-[12px] font-extrabold text-amber-750 dark:text-amber-400 uppercase tracking-wide">
                {proximos} PRÓXIMOS A VENCER (≤ 30 DÍAS)
              </span>
              <span className="font-sans text-[11px] font-semibold text-amber-650/95 dark:text-amber-400 mt-0.5 uppercase tracking-wide">
                {primerNombre} {masStr}
              </span>
            </div>
            <ChevronRight size={14} className="text-amber-500 shrink-0 opacity-60" />
          </div>
        </Link>
      );
    }

    return (
      <div className="flex flex-row items-center gap-[10px] bg-primary/3 dark:bg-primary/5 border border-primary/10 border-l-[3px] border-l-primary py-[10px] px-[14px] min-h-[48px] rounded-[3px] text-left">
        <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 animate-pulse" />
        <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex-1">
          OPERACIONAL — SIN VENCIMIENTOS CRÍTICOS
        </span>
      </div>
    );
  }

  if (vencidos > 0) {
    const primerNombre = vencidosItems[0]?.nombre || "Producto";
    const masStr = vencidos > 1 ? `y ${vencidos - 1} más` : "";
    return (
      <Link to="/inventario" search={{ q: primerNombre }} className="block w-full">
        <div className="flex flex-row items-center gap-[10px] bg-[#FCEBEB] border-l-[3px] border-l-[#E24B4A] rounded-r-lg py-[10px] px-[14px] min-h-[52px] cursor-pointer hover:brightness-95 transition-all">
          <AlertCircle size={18} color="#E24B4A" className="shrink-0" />
          <div className="flex-1 flex flex-col justify-center">
            <span className="font-sans text-[13px] font-medium text-[#A32D2D] leading-tight">
              {vencidos} productos vencidos — retirar de góndola hoy
            </span>
            <span className="font-sans text-[11px] text-[#A32D2D] opacity-70 leading-tight mt-0.5">
              {primerNombre} {masStr}
            </span>
          </div>
          <ChevronRight size={16} color="#E24B4A" className="shrink-0 opacity-50" />
        </div>
      </Link>
    );
  }

  if (proximos > 0) {
    const primerNombre = proximosItems[0]?.nombre || "Producto";
    const masStr = proximos > 1 ? `y ${proximos - 1} más` : "";
    return (
      <Link to="/inventario" search={{ q: primerNombre }} className="block w-full">
        <div className="flex flex-row items-center gap-[10px] bg-[#FAEEDA] border-l-[3px] border-l-[#EF9F27] rounded-r-lg py-[10px] px-[14px] min-h-[52px] cursor-pointer hover:brightness-95 transition-all">
          <Clock size={18} color="#854F0B" className="shrink-0" />
          <div className="flex-1 flex flex-col justify-center">
            <span className="font-sans text-[13px] font-medium text-[#854F0B] leading-tight">
              {proximos} productos próximos a vencer (≤ 30 días)
            </span>
            <span className="font-sans text-[11px] text-[#854F0B] opacity-70 leading-tight mt-0.5">
              {primerNombre} {masStr}
            </span>
          </div>
          <ChevronRight size={16} color="#854F0B" className="shrink-0 opacity-50" />
        </div>
      </Link>
    );
  }

  return (
    <div className="flex flex-row items-center gap-[10px] bg-[#EAF3DE] border-l-[3px] border-l-[#97C459] rounded-r-lg py-[10px] px-[14px] min-h-[52px]">
      <CheckCircle size={18} color="#639922" className="shrink-0" />
      <span className="font-sans text-[13px] font-medium text-[#3B6D11] flex-1">
        Todo en orden — sin productos vencidos ni próximos a vencer
      </span>
    </div>
  );
}
