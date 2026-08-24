import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";
import { useProfile } from "@/context/ProfileContext";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generatePdfReport } from "@/lib/generate-report-pdf";
import { getExpiryStatus } from "@/lib/expiry";
import { formatInBogota } from "@/lib/date-utils";
import type { StoreId } from "@/types/inventory";
import { fetchSalesData, STORE_ID_MAP, type SaleRecord } from "@/services/analytics.service";

import {
  StockOutPredictionCard,
  SlowMoversCard,
  StoreComparisonCard,
  HeatmapCard,
  RestockSuggestionCard,
} from "@/components/analytics/AnalyticsCards";

import { ReportsKpiGrid } from "@/components/analytics/ReportsKpiGrid";
import { AnalyticsChartsSection } from "@/components/analytics/AnalyticsChartsSection";
import { TopProductsTable } from "@/components/analytics/TopProductsTable";
import { CriticalStockTable, type CriticalItem } from "@/components/analytics/CriticalStockTable";
import { SalesHistoryTable } from "@/components/analytics/SalesHistoryTable";
import { MermasHistoryTable } from "@/components/analytics/MermasHistoryTable";

export const Route = createFileRoute("/informes")({
  head: () => ({
    meta: [{ title: "Informes · FitHub" }],
  }),
  component: Informes,
});

const ALL_STORES: StoreId[] = ["Norte", "Sur", "Centro"];

function Informes() {
  const navigate = useNavigate();
  const { items, mermas, undoMerma } = useInventory();
  const { store } = useStore();
  const { theme, profile } = useProfile();
  
  const [selectedStores, setSelectedStores] = useState<StoreId[]>(() => {
    if (store === "Ambas" || store === "Todas") return ["Norte", "Sur", "Centro"];
    return [store as StoreId];
  });

  const [range, setRange] = useState("semana");
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeMermasInPdf, setIncludeMermasInPdf] = useState(true);
  const [salesDateFilter, setSalesDateFilter] = useState<string>("");
  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [isCriticalExpanded, setIsCriticalExpanded] = useState(false);
  const [isSalesExpanded, setIsSalesExpanded] = useState(false);
  const [isTopProductsExpanded, setIsTopProductsExpanded] = useState(false);
  const [isMermasExpanded, setIsMermasExpanded] = useState(false);

  const toggleStoreSelection = (s: StoreId) => {
    setSelectedStores(prev => {
      if (prev.includes(s)) {
        if (prev.length === 1) return prev;
        return prev.filter(x => x !== s);
      }
      return [...prev, s];
    });
  };

  const selectAllStores = () => {
    setSelectedStores(["Norte", "Sur", "Centro"]);
  };

  const filteredSalesTable = useMemo(() => {
    if (!salesDateFilter) return [...salesData].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return salesData.filter(v => {
      const vDate = formatInBogota(v.created_at, "yyyy-MM-dd");
      return vDate === salesDateFilter;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [salesData, salesDateFilter]);

  const { favorites, toggleFavorite } = useFavorites("fithub_analytics_favs", 2);

  const filteredItems = useMemo(
    () => items.filter((it) => selectedStores.includes(it.tienda_nombre)),
    [items, selectedStores],
  );

  useEffect(() => {
    let isMounted = true;
    async function loadSales() {
      setLoadingSales(true);
      try {
        let days = 7;
        if (range === "mes") days = 30;
        if (range === "global") days = 9999;
        
        const data = await fetchSalesData(selectedStores, days);
        if (isMounted) setSalesData(data);
      } catch (err) {
        console.error("Error fetching analytics sales:", err);
      } finally {
        if (isMounted) setLoadingSales(false);
      }
    }
    loadSales();
    return () => { isMounted = false; };
  }, [range, selectedStores]);

  const { topSold, categoryData, totalUnits } = useMemo(() => {
    const salesMap: Record<string, { category: string; count: number }> = {};
    const catMap: Record<string, number> = {};
    let total = 0;

    for (const v of salesData) {
      if (!v.productos) continue;
      const cat = v.productos.categoria || "Otros";
      if (!salesMap[cat]) {
        salesMap[cat] = { category: cat, count: 0 };
      }
      salesMap[cat].count += v.cantidad;
      catMap[cat] = (catMap[cat] || 0) + v.cantidad;
      total += v.cantidad;
    }

    const topArr = Object.values(salesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(s => ({
        name: s.category.length > 20 ? s.category.substring(0, 20) + '...' : s.category,
        fullName: s.category,
        vendidos: s.count
      }));

    const catArr = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { topSold: topArr, categoryData: catArr, totalUnits: total };
  }, [salesData]);

  const topCategory = categoryData.length > 0 ? categoryData[0].name : "N/A";

  const topProducts = useMemo(() => {
    const productMap: Record<string, { id: string; nombre: string; sku: string; categoria: string; vendidos: number; tienda_id: number }> = {};
    
    for (const v of salesData) {
      if (!v.productos) continue;
      const pId = v.producto_id;
      if (!productMap[pId]) {
        productMap[pId] = {
          id: pId,
          nombre: v.productos.nombre,
          sku: v.productos.articulo || "N/A",
          categoria: v.productos.categoria || "Otros",
          vendidos: 0,
          tienda_id: v.productos.tienda_id
        };
      }
      productMap[pId].vendidos += v.cantidad;
    }
    
    return Object.values(productMap)
      .sort((a, b) => b.vendidos - a.vendidos)
      .slice(0, 10);
  }, [salesData]);

  const criticos: CriticalItem[] = useMemo(() => {
    const arr: CriticalItem[] = [];
    for (const p of filteredItems) {
      for (const l of p.lotes) {
        if (l.cantidad <= 0 || !l.fecha_caducidad) continue;
        const st = getExpiryStatus(l.fecha_caducidad);
        if (st === "vencido" || st === "proximo") {
          arr.push({
            id: l.id,
            tienda: p.tienda_nombre,
            nombre: p.nombre,
            caducidad: l.fecha_caducidad,
            estado: st,
            cantidad: l.cantidad
          });
        }
      }
    }
    return arr.sort((a, b) => new Date(a.caducidad).getTime() - new Date(b.caducidad).getTime());
  }, [filteredItems]);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  const filteredMermas = useMemo(() => {
    const selectedStoreIds = selectedStores.map(st => STORE_ID_MAP[st]);
    let days = 7;
    if (range === "mes") days = 30;
    if (range === "global") days = 9999;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - days);

    return mermas.filter(m => {
      const matchStore = selectedStoreIds.includes(m.tienda_id);
      const matchDate = new Date(m.created_at) >= limitDate;
      return matchStore && matchDate;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [mermas, selectedStores, range]);

  const totalMermasUnits = useMemo(() => {
    return filteredMermas.reduce((acc, m) => acc + m.cantidad, 0);
  }, [filteredMermas]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const storeLabel = selectedStores.length === 3 ? "Todas las sedes (Norte, Sur, Centro)" : selectedStores.join(", ");
      await generatePdfReport({
        store: storeLabel,
        range,
        ventas: salesData as any,
        inventory: filteredItems,
        mermas: includeMermasInPdf ? filteredMermas : [],
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const ALL_CARDS = [
    { id: "stockout", Comp: StockOutPredictionCard },
    { id: "slow", Comp: SlowMoversCard },
    { id: "compare", Comp: StoreComparisonCard },
    { id: "heatmap", Comp: HeatmapCard },
    { id: "restock", Comp: RestockSuggestionCard },
  ];

  const favoriteCards = ALL_CARDS.filter(c => favorites.includes(c.id));
  const otherCards = ALL_CARDS.filter(c => !favorites.includes(c.id));

  return (
    <div className="max-w-[1600px] mx-auto space-y-[24px] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-[16px]">
        <div>
          <h1 className="font-sans text-[22px] font-bold text-[#111827] dark:text-slate-50 transition-colors">
            Informes & Analítica
          </h1>
          <p className="font-sans text-[13px] text-[#6B7280] dark:text-slate-400 mt-[4px] transition-colors">
            Métricas de ventas, rotación de inventario y estimación de quiebre de stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 select-none">Sedes:</span>
            {ALL_STORES.map((s) => {
              const isSelected = selectedStores.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStoreSelection(s)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isSelected
                      ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200/80 dark:border-slate-600"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {s}
                </button>
              );
            })}
            <button
              type="button"
              onClick={selectAllStores}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                selectedStores.length === 3
                  ? "bg-emerald-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Todas
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none px-2">
              <input
                type="checkbox"
                checked={includeMermasInPdf}
                onChange={(e) => setIncludeMermasInPdf(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>Incluir Mermas en PDF</span>
            </label>
          </div>

          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating || filteredItems.length === 0}
            className="h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-2 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Download size={15} />
            {isGenerating ? "Creando PDF..." : `Generar PDF (${selectedStores.length} ${selectedStores.length === 1 ? "tienda" : "tiendas"})`}
          </Button>
        </div>
      </div>

      <ReportsKpiGrid
        stylePreset={profile.stylePreset}
        loadingSales={loadingSales}
        totalUnits={totalUnits}
        range={range}
        topCategory={topCategory}
        totalMermasUnits={totalMermasUnits}
        mermasCount={filteredMermas.length}
        criticosCount={criticos.length}
        onNavigateCategory={(cat) => cat !== "N/A" ? navigate({ to: '/inventario', search: { category: cat } }) : navigate({ to: '/inventario' })}
        onNavigateStatus={(status) => navigate({ to: '/inventario', search: { status } })}
      />

      {favoriteCards.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {favoriteCards.map(c => (
            <c.Comp key={c.id} id={c.id} isFavorite={true} onToggleFavorite={toggleFavorite} productos={filteredItems} ventas={salesData} />
          ))}
        </div>
      )}

      <AnalyticsChartsSection
        loadingSales={loadingSales}
        topSold={topSold}
        categoryData={categoryData}
        isDark={isDark}
        textColor={textColor}
        gridColor={gridColor}
      />

      <TopProductsTable
        topProducts={topProducts}
        isExpanded={isTopProductsExpanded}
        onToggleExpand={() => setIsTopProductsExpanded(!isTopProductsExpanded)}
        onSelectProduct={(nombre) => navigate({ to: "/inventario", search: { q: nombre } })}
      />

      {otherCards.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {otherCards.map(c => (
            <div key={c.id} className={c.id === "compare" || c.id === "heatmap" ? "lg:col-span-1" : ""}>
               <c.Comp id={c.id} isFavorite={false} onToggleFavorite={toggleFavorite} productos={filteredItems} ventas={salesData} />
            </div>
          ))}
        </div>
      )}

      <CriticalStockTable
        criticos={criticos}
        isExpanded={isCriticalExpanded}
        onToggleExpand={() => setIsCriticalExpanded(!isCriticalExpanded)}
        onSelectProduct={(nombre) => navigate({ to: "/inventario", search: { q: nombre } })}
      />

      <SalesHistoryTable
        sales={filteredSalesTable}
        range={range}
        salesDateFilter={salesDateFilter}
        isExpanded={isSalesExpanded}
        onRangeChange={(r) => setRange(r)}
        onDateFilterChange={(d) => setSalesDateFilter(d)}
        onToggleExpand={() => setIsSalesExpanded(!isSalesExpanded)}
        onSelectProduct={(nombre) => navigate({ to: "/inventario", search: { q: nombre } })}
      />

      <MermasHistoryTable
        mermas={filteredMermas}
        items={items}
        totalUnits={totalMermasUnits}
        isExpanded={isMermasExpanded}
        onToggleExpand={() => setIsMermasExpanded(!isMermasExpanded)}
        onUndoMerma={undoMerma}
      />
    </div>
  );
}
