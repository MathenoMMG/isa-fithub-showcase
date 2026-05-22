import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";
import { useProfile } from "@/context/ProfileContext";
import { useFavorites } from "@/hooks/useFavorites";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileBarChart, PackageOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { supabase } from "@/lib/supabase";
import { generatePdfReport } from "@/lib/generate-report-pdf";
import { getExpiryStatus } from "@/lib/expiry";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  StockOutPredictionCard,
  SlowMoversCard,
  StoreComparisonCard,
  HeatmapCard,
  RestockSuggestionCard,
} from "@/components/analytics/AnalyticsCards";

export const Route = createFileRoute("/informes")({
  head: () => ({
    meta: [{ title: "Informes · FitHub" }],
  }),
  component: Informes,
});

const PIE_COLORS = ['#059669', '#0284c7', '#d97706', '#9333ea', '#db2777', '#0d9488', '#2563eb', '#65a30d'];

function Informes() {
  const navigate = useNavigate();
  const { items } = useInventory();
  const { store } = useStore();
  const { theme } = useProfile();
  const [range, setRange] = useState("semana");
  const [isGenerating, setIsGenerating] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);

  const { favorites, toggleFavorite } = useFavorites("fithub_analytics_favs", 2);

  // We only show items from the selected store (or both)
  const filteredItems = useMemo(
    () => (store === "Ambas" ? items : items.filter((it) => it.tienda_nombre === store)),
    [items, store],
  );

  // Fetch sales to have real category breakdown based on time
  useEffect(() => {
    let isMounted = true;
    async function fetchSales() {
      setLoadingSales(true);
      try {
        let days = 7;
        if (range === "mes") days = 30;
        if (range === "global") days = 9999;
        
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        const isoLimit = dateLimit.toISOString();

        const { data: ventas, error } = await supabase
          .from("ventas")
          .select("*, productos(tienda_id, nombre, categoria, articulo)")
          .gte("created_at", isoLimit);
          
        if (error) throw error;

        const storeId = store === "Sur" ? 2 : store === "Norte" ? 1 : null;
        const filteredVentas = storeId 
          ? ventas?.filter(v => v.productos?.tienda_id === storeId)
          : ventas;

        if (isMounted) setSalesData(filteredVentas || []);
      } catch (err) {
        console.error("Error fetching analytics sales:", err);
      } finally {
        if (isMounted) setLoadingSales(false);
      }
    }
    fetchSales();
    return () => { isMounted = false };
  }, [range, store]);

  // Derive metrics
  const { topSold, categoryData, totalUnits } = useMemo(() => {
    const salesMap: Record<string, { category: string; count: number }> = {};
    const catMap: Record<string, number> = {};
    let total = 0;

    for (const v of salesData) {
      if (!v.productos) continue;
      
      const cat = v.productos.categoria || "Otros";
      const key = cat;
      
      if (!salesMap[key]) {
        salesMap[key] = {
          category: cat,
          count: 0
        };
      }
      
      salesMap[key].count += v.cantidad;
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

  // Critical Stock
  const criticos = useMemo(() => {
    const arr = [];
    for (const p of filteredItems) {
      for (const l of p.lotes) {
        if (!l.fecha_caducidad) continue;
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
  const textColor = isDark ? "#94a3b8" : "#64748b"; // slate-400 : slate-500
  const gridColor = isDark ? "#334155" : "#e2e8f0"; // slate-700 : slate-200

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await generatePdfReport({
        store,
        range,
        ventas: salesData as any,
        inventory: filteredItems,
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
        <div>
          <h1 className="font-sans text-[22px] font-bold text-[#111827] dark:text-slate-50 transition-colors">
            Panel de Analítica
          </h1>
          <p className="font-sans text-[13px] text-[#6B7280] dark:text-slate-400 mt-1 transition-colors max-w-xl">
            Monitorea el rendimiento de {store}, analiza ventas por categoría y controla productos en riesgo.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-[10px]">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-full sm:w-[180px] h-[44px] bg-white dark:bg-slate-900 border-[0.5px] border-[#E5E7EB] dark:border-slate-800 dark:text-slate-200 font-sans text-[13px] transition-colors rounded-[8px] focus:ring-0">
              <SelectValue placeholder="Rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana" className="font-sans text-[13px] py-2">Últimos 7 días</SelectItem>
              <SelectItem value="mes" className="font-sans text-[13px] py-2">Últimos 30 días</SelectItem>
              <SelectItem value="global" className="font-sans text-[13px] py-2">Histórico Global</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleGeneratePDF} 
            disabled={isGenerating || loadingSales}
            className="w-full sm:w-auto h-[44px] bg-[#1C4A2E] hover:bg-[#1C4A2E]/90 text-white gap-[8px] font-sans font-medium px-[20px] rounded-[8px] transition-colors cursor-pointer"
          >
            <Download size={16} />
            {isGenerating ? "Creando PDF..." : "Generar Reporte PDF"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
        <Card className="p-[16px_20px] rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all flex flex-col justify-between h-[100px]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[32px] h-[32px] rounded-[6px] bg-[#EAF3DE] dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <TrendingUp size={16} color="#1C4A2E" className="dark:text-emerald-400" />
            </div>
            <p className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium text-[#9CA3AF]">Total Vendidos</p>
          </div>
          <h4 className="font-mono-data text-[24px] font-semibold text-[#111827] dark:text-slate-50 mt-auto">
            {loadingSales ? "-" : totalUnits} <span className="font-sans text-[14px] text-[#6B7280] font-normal">uds</span>
          </h4>
        </Card>
        
        <Card className="p-[16px_20px] rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all flex flex-col justify-between h-[100px]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[32px] h-[32px] rounded-[6px] bg-[#EAF3DE] dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <PackageOpen size={16} color="#1C4A2E" className="dark:text-emerald-400" />
            </div>
            <p className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium text-[#9CA3AF]">Categoría Estrella</p>
          </div>
          <h4 className="font-sans text-[20px] font-semibold text-[#111827] dark:text-slate-50 mt-auto truncate">
            {loadingSales ? "-" : topCategory}
          </h4>
        </Card>

        <Card className="p-[16px_20px] rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all flex flex-col justify-between h-[100px]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[32px] h-[32px] rounded-[6px] bg-[#FCEBEB] dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} color="#A32D2D" className="dark:text-red-400" />
            </div>
            <p className="font-sans text-[10px] uppercase tracking-[0.05em] font-medium text-[#9CA3AF]">Lotes Críticos</p>
          </div>
          <h4 className="font-mono-data text-[24px] font-semibold text-[#A32D2D] dark:text-red-400 mt-auto">
            {criticos.length} <span className="font-sans text-[14px] text-[#A32D2D]/70 font-normal">alertas</span>
          </h4>
        </Card>
      </div>

      {/* Favoritos */}
      {favoriteCards.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {favoriteCards.map(c => (
            <c.Comp key={c.id} id={c.id} isFavorite={true} onToggleFavorite={toggleFavorite} productos={filteredItems} ventas={salesData} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="p-[24px] rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2 transition-all">
          <h3 className="font-sans text-[16px] font-bold text-[#111827] dark:text-slate-100 mb-[24px] transition-colors">Top Categorías Más Vendidas</h3>
          <div className="h-[350px] w-full" id="chart-container">
            {loadingSales ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Cargando datos...</div>
            ) : topSold.filter(t => t.vendidos > 0).length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSold} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 11, fill: textColor }}
                    tickLine={false}
                    axisLine={{ stroke: gridColor }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: textColor }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: isDark ? '1px solid #334155' : 'none', 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value: number) => [`${value} uds`]}
                  />
                  <Bar dataKey="vendidos" radius={[6, 6, 0, 0]}>
                    {topSold.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <FileBarChart size={32} className="text-[#D1D5DB] dark:text-slate-700 mb-3" />
                <p className="font-sans text-[13px] text-[#6B7280] dark:text-slate-400">Registra conteos para ver el análisis por categoría</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Ventas por Categoría</h3>
          <div className="h-[350px] w-full">
            {loadingSales ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Cargando...</div>
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke={isDark ? "#0f172a" : "#ffffff"}
                    strokeWidth={2}
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: isDark ? '1px solid #334155' : 'none', 
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                    formatter={(val: number) => [`${val} uds`]}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: textColor }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                Sin datos
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Otras Tarjetas Analíticas */}
      {otherCards.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {otherCards.map(c => (
            <div key={c.id} className={c.id === "compare" || c.id === "heatmap" ? "lg:col-span-1" : ""}>
               <c.Comp id={c.id} isFavorite={false} onToggleFavorite={toggleFavorite} productos={filteredItems} ventas={salesData} />
            </div>
          ))}
        </div>
      )}

      {/* Critical Stock Table */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Visor de Stock Crítico</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Tienda</th>
                <th className="px-6 py-4">Caducidad</th>
                <th className="px-6 py-4 text-right">Uds.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {criticos.length > 0 ? (
                criticos.map((lote) => (
                  <tr 
                    key={lote.id} 
                    onClick={() => navigate({ to: "/inventario", search: { q: lote.nombre } })}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      {lote.estado === "vencido" ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          Vencido
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          Próximo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{lote.nombre}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{lote.tienda}</td>
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {format(new Date(lote.caducidad), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-slate-200">
                      {lote.cantidad}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No hay productos vencidos o próximos a vencer. ¡Excelente!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
