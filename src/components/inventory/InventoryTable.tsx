import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductoConLotes } from "@/types/inventory";
import { ProductRow } from "./ProductRow";

interface Props {
  data: ProductoConLotes[];
  collapseCounter: number;
  expandCounter: number;
}

export function InventoryTable({ data, collapseCounter, expandCounter }: Props) {
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

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-400 transition-colors">
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

  useEffect(() => {
    if (collapseCounter > 0) setOpen(false);
  }, [collapseCounter]);

  useEffect(() => {
    if (expandCounter > 0) setOpen(true);
  }, [expandCounter]);

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-[8px] bg-[#F9FAF8] dark:bg-slate-900/80 border-l-[3px] border-l-[#1C4A2E] dark:border-l-emerald-500 rounded-r-md p-[10px_14px] text-left hover:brightness-95 transition-all outline-none"
      >
        <span className="font-sans text-[14px] font-semibold text-[#1C4A2E] dark:text-emerald-400 leading-none">
          {linea}
        </span>
        <span className="font-sans text-[11px] font-medium bg-[#EAF3DE] dark:bg-emerald-900/40 text-[#3B6D11] dark:text-emerald-400 px-[8px] py-[2px] rounded-full leading-none">
          {items.length}
        </span>
        <div className="ml-auto text-[#1C4A2E] dark:text-emerald-400">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>
      {open && (
        <div className="mt-2 space-y-2 ml-3 pl-3 border-l-[1.5px] border-slate-100 dark:border-slate-800">
          {items.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
