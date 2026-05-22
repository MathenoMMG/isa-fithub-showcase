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
        className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-3 sm:p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all outline-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-5 bg-emerald-600 dark:bg-emerald-500 rounded-full opacity-80" />
          <span className="font-sans text-[16px] font-extrabold text-slate-700 dark:text-slate-200 tracking-tight uppercase">
            {linea}
          </span>
          <span className="font-sans text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full shadow-sm">
            {items.length} {items.length === 1 ? 'ud' : 'uds'}
          </span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg shadow-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {open ? <ChevronDown size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
        </div>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {items.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
