import { Link, useNavigate } from "@tanstack/react-router";
import { useInventory } from "@/context/InventoryContext";
import { Package } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis } from "recharts";
import { useProfile } from "@/context/ProfileContext";

export function DashboardAlerts() {
  const { filteredItems } = useInventory();
  const { profile } = useProfile();
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

  const isPremium = profile.stylePreset === "obsidian";

  if (isPremium) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
        {/* Panel "Atención inmediata" Premium */}
        <div className="border border-border dark:border-primary/6 rounded-[3px] bg-card/30 dark:bg-slate-900/30 flex flex-col justify-between overflow-hidden dark:backdrop-blur-[12px] dark:backdrop-saturate-[140%] dark:shadow-[inset_0_0.5px_0_oklch(0.82_0.16_160/4%)]">
          <div className="flex justify-between items-center p-[12px_14px] border-b border-border dark:border-primary/6 bg-slate-50/50 dark:bg-slate-950/20">
            <h3 className="font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-wider">
              ATENCIÓN INMEDIATA
            </h3>
            <Link to="/inventario" className="font-mono text-[10px] text-primary dark:text-emerald-400 cursor-pointer hover:underline transition-all duration-300">
              VER TODO
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col divide-y divide-dashed divide-border/60 dark:divide-primary/5">
            {urgentLotes.length > 0 ? (
              urgentLotes.map((lote) => {
                const status = getStatus(lote.fecha_caducidad);
                
                return (
                  <div 
                    key={lote.id} 
                    onClick={() => navigate({ to: "/inventario", search: { q: lote.producto.nombre } })}
                    className="flex items-center gap-3 p-[10px_14px] hover:bg-muted/40 dark:hover:bg-primary/3 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-center shrink-0 w-4">
                      <span className={`w-1 h-1 rounded-none ${status === "vencido" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="premium-product-name-list text-[12px] text-slate-950 dark:text-slate-200 truncate">
                        {lote.producto.nombre}
                      </div>
                      <div className="font-sans text-[10px] font-semibold text-muted-foreground/70 mt-0.5 uppercase tracking-wider">
                        {lote.producto.categoria} // {lote.producto.tienda_nombre}
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <div className="text-[10px] text-muted-foreground">
                        {lote.fecha_caducidad ? new Date(lote.fecha_caducidad).toLocaleDateString("es-CO", { day: '2-digit', month: '2-digit' }) : "—"}
                      </div>
                      <div className={`mt-0.5 text-[9px] font-semibold uppercase ${status === "vencido" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {lote.fecha_caducidad ? getDaysLabel(lote.fecha_caducidad) : "Sin fecha"}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-[24px] text-center flex flex-col items-center justify-center flex-1">
                <Package size={24} className="mb-2 text-muted-foreground/40" />
                <div className="font-mono text-[11px] text-muted-foreground uppercase">REGISTRO VACÍO</div>
              </div>
            )}
          </div>
        </div>

        {/* Panel "Tendencia semanal" Premium */}
        <div className="border border-border dark:border-primary/6 rounded-[3px] bg-card/30 dark:bg-slate-900/30 flex flex-col justify-between overflow-hidden dark:backdrop-blur-[12px] dark:backdrop-saturate-[140%] dark:shadow-[inset_0_0.5px_0_oklch(0.82_0.16_160/4%)]">
          <div className="flex justify-between items-center p-[12px_14px] border-b border-border dark:border-primary/6 bg-slate-50/50 dark:bg-slate-950/20">
            <h3 className="font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-wider">
              TENDENCIA SEMANAL
            </h3>
            <span className="font-mono text-[9px] text-muted-foreground uppercase">
              VENCIMIENTOS
            </span>
          </div>

          <div className="p-[14px_14px_10px_14px] h-[72px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" fontSize={8} fill="currentColor" className="text-muted-foreground/60 font-mono" tickLine={false} axisLine={false} />
                <Bar dataKey="vencidos" fill="var(--color-primary)" opacity={0.35} radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-border dark:border-primary/6 p-[12px_14px] flex divide-x divide-border dark:divide-primary/6 bg-slate-50/20 dark:bg-slate-950/10">
            <div className="flex-1 text-center pr-2">
              <p className="font-mono text-[18px] font-semibold text-emerald-700 dark:text-emerald-400 m-0">0</p>
              <p className="font-mono text-[8px] text-muted-foreground/70 uppercase tracking-wider mt-0.5">ESTA SEMANA</p>
            </div>
            <div className="flex-1 text-center px-2">
              <p className="font-mono text-[18px] font-semibold text-amber-700 dark:text-amber-400 m-0">0</p>
              <p className="font-mono text-[8px] text-muted-foreground/70 uppercase tracking-wider mt-0.5">RETIROS</p>
            </div>
            <div className="flex-1 text-center pl-2">
              <p className="font-mono text-[18px] font-semibold text-slate-800 dark:text-slate-200 m-0">
                {new Set(filteredItems.map(i => i.categoria)).size}
              </p>
              <p className="font-mono text-[8px] text-muted-foreground/70 uppercase tracking-wider mt-0.5">LÍNEAS</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
