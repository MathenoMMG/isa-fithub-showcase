import { Link, useNavigate } from "@tanstack/react-router";
import { useInventory } from "@/context/InventoryContext";
import { Package } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis } from "recharts";

export function DashboardAlerts() {
  const { filteredItems } = useInventory();
  const navigate = useNavigate();

  // "Atención inmediata" top 6 urgent items (based on lotes expiration)
  const urgentLotes = filteredItems
    .flatMap((p) => p.lotes.map((l) => ({ ...l, producto: p })))
    .filter((l) => l.fecha_caducidad != null)
    .sort((a, b) => new Date(a.fecha_caducidad!).getTime() - new Date(b.fecha_caducidad!).getTime())
    .slice(0, 6);

  const getStatus = (fecha: string | null) => {
    if (!fecha) return "ok";
    const days = (new Date(fecha).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    if (days < 0) return "vencido";
    if (days <= 30) return "proximo";
    return "ok";
  };

  const getDaysLabel = (fecha: string) => {
    const days = Math.ceil((new Date(fecha).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (days < 0) return `Vencido hace ${Math.abs(days)}d`;
    if (days === 0) return "Vence hoy";
    return `Vence en ${days}d`;
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "vencido":
        return { bg: "bg-[#FCEBEB] dark:bg-red-900/10", dot: "bg-[#E24B4A]", text: "text-[#A32D2D] dark:text-red-400", border: "border-[#E24B4A]/30" };
      case "proximo":
        return { bg: "bg-[#FAEEDA] dark:bg-amber-900/10", dot: "bg-[#EF9F27]", text: "text-[#854F0B] dark:text-amber-400", border: "border-[#EF9F27]/30" };
      default:
        return { bg: "bg-white dark:bg-slate-900", dot: "bg-[#97C459]", text: "text-[#3B6D11] dark:text-emerald-400", border: "border-[#97C459]/30" };
    }
  };

  const trendData = [
    { name: "L", vencidos: 0 },
    { name: "M", vencidos: 0 },
    { name: "X", vencidos: 0 },
    { name: "J", vencidos: 0 },
    { name: "V", vencidos: 0 },
    { name: "S", vencidos: 0 },
    { name: "D", vencidos: 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
      {/* Panel "Atención inmediata" */}
      <div className="bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] overflow-hidden flex flex-col shadow-sm">
        <div className="flex justify-between items-center p-[12px_14px] border-b-[0.5px] border-[#F3F4F6] dark:border-slate-800">
          <h3 className="font-sans text-[13px] font-semibold text-[#111827] dark:text-slate-100">
            Atención inmediata
          </h3>
          <Link to="/inventario" className="font-sans text-[11px] text-[#1C4A2E] dark:text-emerald-400 cursor-pointer hover:underline">
            Ver todos →
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col">
          {urgentLotes.length > 0 ? (
            urgentLotes.map((lote) => {
              const status = getStatus(lote.fecha_caducidad);
              const styles = getStatusStyles(status);
              
              return (
                <div 
                  key={lote.id} 
                  onClick={() => navigate({ to: "/inventario", search: { q: lote.producto.nombre } })}
                  className={`flex items-center gap-[10px] p-[9px_14px] border-b-[0.5px] border-[#F9FAFB] dark:border-slate-800 ${styles.bg} cursor-pointer hover:brightness-95 transition-all`}
                >
                  <div className={`w-[8px] h-[8px] rounded-full shrink-0 ${styles.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-[11px] font-medium text-[#111827] dark:text-slate-200 truncate">
                      {lote.producto.nombre}
                    </div>
                    <div className="font-sans text-[9px] text-[#9CA3AF] mt-[1px]">
                      {lote.producto.categoria} · {lote.producto.tienda_nombre}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-data text-[10px] text-[#6B7280] dark:text-slate-400">
                      {lote.fecha_caducidad ? new Date(lote.fecha_caducidad).toLocaleDateString("es-CO", { day: '2-digit', month: '2-digit' }) : "—"}
                    </div>
                    <div className={`mt-1 font-sans text-[9px] font-medium px-[6px] py-[1px] rounded-full bg-white dark:bg-slate-800 border-[0.5px] ${styles.border} ${styles.text}`}>
                      {lote.fecha_caducidad ? getDaysLabel(lote.fecha_caducidad) : "Sin fecha"}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-[24px] text-center flex flex-col items-center justify-center flex-1">
              <Package size={32} color="#D1D5DB" className="mb-2" />
              <div className="font-sans text-[12px] text-[#9CA3AF]">Sin fechas de vencimiento registradas</div>
              <div className="font-sans text-[11px] text-[#9CA3AF] mt-1">Registra un lote para comenzar</div>
            </div>
          )}
        </div>
      </div>

      {/* Panel "Tendencia semanal" */}
      <div className="bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 rounded-[10px] overflow-hidden flex flex-col shadow-sm">
        <div className="flex justify-between items-center p-[12px_14px]">
          <h3 className="font-sans text-[13px] font-semibold text-[#111827] dark:text-slate-100">
            Tendencia semanal
          </h3>
          <span className="font-sans text-[10px] text-[#9CA3AF]">
            vencidos por día
          </span>
        </div>

        <div className="p-[0_14px_12px_14px] h-[72px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="name" fontSize={8} fill="#9CA3AF" tickLine={false} axisLine={false} />
              <Bar dataKey="vencidos" fill="#F3F4F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border-t-[0.5px] border-[#F3F4F6] dark:border-slate-800 p-[10px_14px] flex">
          <div className="flex-1 text-center border-r-[0.5px] border-[#F3F4F6] dark:border-slate-800">
            <p className="font-mono-data text-[18px] font-semibold text-[#3B6D11] m-0">0</p>
            <p className="font-sans text-[9px] text-[#9CA3AF] uppercase tracking-[0.05em]">Esta semana</p>
          </div>
          <div className="flex-1 text-center border-r-[0.5px] border-[#F3F4F6] dark:border-slate-800">
            <p className="font-mono-data text-[18px] font-semibold text-[#854F0B] m-0">0</p>
            <p className="font-sans text-[9px] text-[#9CA3AF] uppercase tracking-[0.05em]">Retiros</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-mono-data text-[18px] font-semibold text-[#111827] dark:text-slate-200 m-0">
              {new Set(filteredItems.map(i => i.categoria)).size}
            </p>
            <p className="font-sans text-[9px] text-[#9CA3AF] uppercase tracking-[0.05em]">Líneas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
