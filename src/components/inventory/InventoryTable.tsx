import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductoConLotes } from "@/types/inventory";
import { ProductRow } from "./ProductRow";
import { useProfile } from "@/context/ProfileContext";

interface Props {
  data: ProductoConLotes[];
  collapseCounter: number;
  expandCounter: number;
}

export function InventoryTable({ data, collapseCounter, expandCounter }: Props) {
  const { profile } = useProfile();
  
  const grouped = useMemo(() => {
    const map = new Map<string, ProductoConLotes[]>();
    for (const item of data) {
      const cat = item.categoria || "Otros";
      const arr = map.get(cat) ?? [];
      arr.push(item);
      map.set(cat, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  const isPremium = profile.stylePreset === "obsidian";

  if (data.length === 0) {
    return (
      <div className={
        isPremium
          ? "rounded-[3px] border border-border dark:border-primary/5 bg-card/30 dark:bg-slate-900/30 p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-wider"
          : "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-400 transition-colors"
      }>
        No hay productos que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([linea, items]) => (
        <LineaGroup 
          key={linea} 
          linea={linea} 
          items={items} 
          collapseCounter={collapseCounter} 
          expandCounter={expandCounter} 
        />
      ))}
    </div>
  );
}

function LineaGroup({ 
  linea, 
  items, 
  collapseCounter, 
  expandCounter 
}: { 
  linea: string; 
  items: ProductoConLotes[];
  collapseCounter: number;
  expandCounter: number;
}) {
  const [open, setOpen] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    if (collapseCounter > 0) setOpen(false);
  }, [collapseCounter]);

  useEffect(() => {
    if (expandCounter > 0) setOpen(true);
  }, [expandCounter]);

  const isPremium = profile.stylePreset === "obsidian";

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className={
          isPremium
            ? "w-full flex items-center gap-[8px] bg-card/30 dark:bg-slate-900/30 border border-border dark:border-primary/5 border-l-[4px] border-l-primary dark:border-l-emerald-400 rounded-[2px] p-[10px_14px] text-left hover:bg-muted/40 dark:hover:bg-primary/5 transition-all outline-none"
            : "w-full flex items-center gap-[8px] bg-[#F9FAF8] dark:bg-slate-900/80 border-l-[3px] border-l-[#1C4A2E] dark:border-l-emerald-500 rounded-[10px] p-[10px_14px] text-left hover:brightness-95 transition-all outline-none"
        }
      >
        <span className={isPremium ? "font-mono text-[11px] font-bold text-slate-950 dark:text-emerald-400 leading-none uppercase tracking-wider" : "font-sans text-[14px] font-semibold text-[#1C4A2E] dark:text-emerald-400 leading-none"}>
          {linea}
        </span>
        <span className={
          isPremium
            ? "font-mono text-[9px] font-bold bg-muted/40 dark:bg-primary/5 text-primary dark:text-emerald-400 border border-border dark:border-primary/5 px-2 py-0.5 rounded-[2px] leading-none"
            : "font-sans text-[11px] font-medium bg-[#EAF3DE] dark:bg-emerald-900/40 text-[#3B6D11] dark:text-emerald-400 px-[8px] py-[2px] rounded-full leading-none"
        }>
          {items.length}
        </span>
        <div className={isPremium ? "ml-auto text-primary dark:text-emerald-400" : "ml-auto text-[#1C4A2E] dark:text-emerald-400"}>
          <ChevronRight size={16} className={`transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"}`} />
        </div>
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"}`}
      >
        <div className="overflow-hidden">
          <div className={`space-y-2 ml-3 pl-3 border-l ${isPremium ? "border-border dark:border-primary/5" : "border-slate-100 dark:border-slate-800"} py-1`}>
            {items.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
