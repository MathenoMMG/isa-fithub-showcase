import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { KpiCards } from "@/components/inventory/KpiCards";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ExportExcelButton } from "@/components/inventory/ExportExcelButton";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { CategoryManagerDialog } from "@/components/inventory/CategoryManagerDialog";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";
import { getExpiryStatus } from "@/lib/expiry";

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
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

  // State for collapse/expand all
  const [collapseCounter, setCollapseCounter] = useState(0);
  const [expandCounter, setExpandCounter] = useState(0);

  // Funciones para filtros rápidos desde KpiCards
  const onFilterStock = () => {
    setStatusFilters(["stock"]);
    setCategoryFilters([]);
    setSearch("");
  };
  
  const onFilterProximos = () => {
    setStatusFilters(["proximo"]);
    setCategoryFilters([]);
    setSearch("");
  };
  
  const onFilterVencidos = () => {
    setStatusFilters(["vencido"]);
    setCategoryFilters([]);
    setSearch("");
  };

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(filteredItems.map(i => i.categoria).filter(Boolean))).sort();
  }, [filteredItems]);

  const visibleItems = useMemo(() => {
    let result = filteredItems;

    // Filtro por búsqueda de texto
    if (search.trim()) {
      const qs = search.toLowerCase();
      result = result.filter(
        (it) =>
          (it.articulo?.toLowerCase() || "").includes(qs) ||
          (it.nombre?.toLowerCase() || "").includes(qs) ||
          (it.categoria?.toLowerCase() || "").includes(qs)
      );
    }

    // Filtro por categorías seleccionadas
    if (categoryFilters.length > 0) {
      result = result.filter(it => categoryFilters.includes(it.categoria));
    }

    // Filtro por estado (Vencido, Próximo a vencer, Con Stock)
    if (statusFilters.length > 0) {
      result = result.filter(it => {
        const hasStock = it.lotes.reduce((acc, l) => acc + l.cantidad, 0) > 0;
        
        // Si el filtro "stock" está activo, y no tiene stock, no pasa.
        if (statusFilters.includes("stock") && !hasStock) {
          return false;
        }

        // Si solo está el filtro "stock" y tiene stock, pasa.
        if (statusFilters.length === 1 && statusFilters.includes("stock")) {
          return true;
        }

        // Si hay otros filtros de caducidad, verificamos si cumple alguno de los lotes con stock (o cualquier lote dependiendo de la lógica, pero preferiblemente lotes con stock)
        return it.lotes.some(lote => {
          const st = getExpiryStatus(lote.fecha_caducidad);
          return statusFilters.includes(st) && (!statusFilters.includes("stock") || lote.cantidad > 0);
        });
      });
    }

    return result;
  }, [filteredItems, search, categoryFilters, statusFilters]);

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
          <CategoryManagerDialog />
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
        <KpiCards 
          items={filteredItems}
          onFilterStock={onFilterStock}
          onFilterProximos={onFilterProximos}
          onFilterVencidos={onFilterVencidos}
        />
      )}

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full sm:max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por artículo, nombre o categoría…"
            className="h-12 pl-11 text-base rounded-xl border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-slate-200 transition-colors"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 w-full sm:w-auto border-dashed bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl">
              <Filter className="mr-2 h-4 w-4" />
              Filtros {(statusFilters.length > 0 || categoryFilters.length > 0) && `(${statusFilters.length + categoryFilters.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
            <DropdownMenuLabel className="font-semibold text-slate-800 dark:text-slate-200">Estado de Caducidad / Stock</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuCheckboxItem 
              checked={statusFilters.includes("stock")}
              onCheckedChange={(c) => setStatusFilters(prev => c ? [...prev, "stock"] : prev.filter(x => x !== "stock"))}
              className="dark:text-slate-300 dark:focus:bg-slate-800"
            >
              Con Stock (&gt;0)
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilters.includes("vencido")}
              onCheckedChange={(c) => setStatusFilters(prev => c ? [...prev, "vencido"] : prev.filter(x => x !== "vencido"))}
              className="dark:text-slate-300 dark:focus:bg-slate-800"
            >
              Vencido
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilters.includes("proximo")}
              onCheckedChange={(c) => setStatusFilters(prev => c ? [...prev, "proximo"] : prev.filter(x => x !== "proximo"))}
              className="dark:text-slate-300 dark:focus:bg-slate-800"
            >
              Próximo a vencer
            </DropdownMenuCheckboxItem>
            
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuLabel className="font-semibold text-slate-800 dark:text-slate-200">Categorías</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <div className="max-h-48 overflow-y-auto">
              {uniqueCategories.map(cat => (
                <DropdownMenuCheckboxItem 
                  key={cat}
                  checked={categoryFilters.includes(cat)}
                  onCheckedChange={(c) => setCategoryFilters(prev => c ? [...prev, cat] : prev.filter(x => x !== cat))}
                  className="dark:text-slate-300 dark:focus:bg-slate-800"
                >
                  {cat}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
            
            {(statusFilters.length > 0 || categoryFilters.length > 0) && (
              <>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                <div className="p-1">
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 justify-start"
                    onClick={() => { setStatusFilters([]); setCategoryFilters([]); }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {(statusFilters.length > 0 || categoryFilters.length > 0 || search.trim()) && (
          <Button 
            variant="ghost" 
            className="h-12 text-slate-500 dark:text-slate-400 shrink-0"
            onClick={() => { setStatusFilters([]); setCategoryFilters([]); setSearch(""); }}
          >
            Resetear
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto shrink-0 border-l border-slate-200 dark:border-slate-800 pl-3">
          <Button 
            variant="ghost" 
            className="h-12 text-slate-600 dark:text-slate-300"
            onClick={() => setCollapseCounter(c => c + 1)}
          >
            Contraer todo
          </Button>
          <Button 
            variant="ghost" 
            className="h-12 text-slate-600 dark:text-slate-300"
            onClick={() => setExpandCounter(c => c + 1)}
          >
            Expandir todo
          </Button>
        </div>
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
