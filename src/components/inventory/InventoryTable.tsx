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
        className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 text-left hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="font-sans text-[15px] font-bold text-slate-800 dark:text-slate-100">
            {linea}
          </span>
          <span className="font-sans text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 p-1 rounded-md">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
