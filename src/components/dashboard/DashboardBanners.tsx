import { AlertCircle, Clock, CheckCircle, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useInventory } from "@/context/InventoryContext";
import { countLotesByStatus } from "@/lib/expiry";

export function DashboardBanners() {
  const { filteredItems } = useInventory();
  const allLotes = filteredItems.flatMap((i) => i.lotes);
  const { proximos, vencidos } = countLotesByStatus(allLotes);

  // We need to find the name of the first expired or near-expiry product
  const vencidosItems = filteredItems.filter(p => p.lotes.some(l => {
    if (!l.fecha_caducidad) return false;
    const days = (new Date(l.fecha_caducidad).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return days < 0;
  }));

  const proximosItems = filteredItems.filter(p => p.lotes.some(l => {
    if (!l.fecha_caducidad) return false;
    const days = (new Date(l.fecha_caducidad).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return days >= 0 && days <= 30;
  }));

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
