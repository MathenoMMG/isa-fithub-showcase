import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KpiCards } from "@/components/inventory/KpiCards";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ExportExcelButton } from "@/components/inventory/ExportExcelButton";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";

import { Skeleton } from "@/components/ui/skeleton";

type ProductSearch = {
  q?: string;
};

export const Route = createFileRoute("/inventario")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      q: search.q as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Inventario · FitHub" },
      { name: "description", content: "Control de inventario por tienda con seguimiento de caducidades por lote." },
    ],
  }),
  component: InventarioPage,
});

function InventarioPage() {
  const { filteredItems, loading } = useInventory();
  const { store } = useStore();
  const { q } = Route.useSearch();
  const [search, setSearch] = useState(q || "");

  const visibleItems = useMemo(() => {
    if (!search.trim()) return filteredItems;
    const q = search.toLowerCase();
    return filteredItems.filter(
      (it) =>
        (it.articulo?.toLowerCase() || "").includes(q) ||
        (it.nombre?.toLowerCase() || "").includes(q) ||
        (it.categoria?.toLowerCase() || "").includes(q)
    );
  }, [filteredItems, search]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header con acción protagónica */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Inventario</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Tienda: <span className="font-semibold text-slate-700 dark:text-slate-300">{store === "Ambas" ? "Ambas" : store}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportExcelButton items={visibleItems} />
          <AddProductDialog />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <KpiCards items={filteredItems} />
      )}

      {/* Búsqueda */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por artículo, nombre o categoría…"
          className="h-12 pl-11 text-base rounded-xl border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-slate-200 transition-colors"
        />
      </div>

      {loading ? (
        <div className="space-y-4 mt-8">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : (
        <InventoryTable data={visibleItems} />
      )}
    </div>
  );
}
