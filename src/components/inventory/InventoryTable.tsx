import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/types/inventory";
import { ProductRow } from "./ProductRow";

interface Props {
  data: InventoryItem[];
}

export function InventoryTable({ data }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    for (const item of data) {
      const arr = map.get(item.linea_producto) ?? [];
      arr.push(item);
      map.set(item.linea_producto, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        No hay productos que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([linea, items]) => (
        <LineaGroup key={linea} linea={linea} items={items} />
      ))}
    </div>
  );
}

function LineaGroup({ linea, items }: { linea: string; items: InventoryItem[] }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-slate-100 rounded-lg"
      >
        {open ? <ChevronDown className="h-5 w-5 text-slate-600" /> : <ChevronRight className="h-5 w-5 text-slate-600" />}
        <h3 className="text-lg font-bold text-slate-800">{linea}</h3>
        <Badge variant="secondary" className="bg-slate-200 text-slate-700">{items.length}</Badge>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {items.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
