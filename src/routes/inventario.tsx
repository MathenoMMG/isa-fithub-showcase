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

export const Route = createFileRoute("/inventario")({
  head: () => ({
    meta: [
      { title: "Inventario · FitHub" },
      { name: "description", content: "Control de inventario por tienda con seguimiento de caducidades por lote." },
    ],
  }),
  component: InventarioPage,
});

function InventarioPage() {
  const { filteredItems } = useInventory();
  const { store } = useStore();
  const [search, setSearch] = useState("");

  const visibleItems = useMemo(() => {
    if (!search.trim()) return filteredItems;
    const q = search.toLowerCase();
    return filteredItems.filter(
      (it) =>
        it.sku.toLowerCase().includes(q) ||
        it.nombre.toLowerCase().includes(q) ||
        it.subcategoria_sabor.toLowerCase().includes(q) ||
        it.linea_producto.toLowerCase().includes(q),
    );
  }, [filteredItems, search]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header con acción protagónica */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Inventario</h2>
          <p className="text-slate-500 mt-1">
            Tienda: <span className="font-semibold text-slate-700">{store === "Ambas" ? "Ambas" : store}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportExcelButton items={visibleItems} />
          <AddProductDialog />
        </div>
      </div>

      <KpiCards items={filteredItems} />

      {/* Búsqueda */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por SKU, nombre o sabor…"
          className="h-12 pl-11 text-base rounded-xl border-slate-300 bg-white"
        />
      </div>

      <InventoryTable data={visibleItems} />
    </div>
  );
}
