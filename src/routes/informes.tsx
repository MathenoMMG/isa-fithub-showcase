import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";
import { useProfile } from "@/context/ProfileContext";
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

export const Route = createFileRoute("/informes")({
  head: () => ({
    meta: [{ title: "Informes · FitHub" }],
  }),
  component: Informes,
});

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

function Informes() {
  const { items } = useInventory();
  const { store } = useStore();
  const { theme } = useProfile();
  const [range, setRange] = useState("semana");
  const [isGenerating, setIsGenerating] = useState(false);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);

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
    const salesMap: Record<string, { name: string; category: string; count: number; tienda: string }> = {};
    const catMap: Record<string, number> = {};
    let total = 0;

    for (const v of salesData) {
      if (!v.productos) continue;
      const tiendaStr = v.productos.tienda_id === 2 ? "Sur" : "Norte";
      const key = `${v.producto_id}-${tiendaStr}`;
      
      if (!salesMap[key]) {
        salesMap[key] = {
          name: v.productos.nombre,
          category: v.productos.categoria || "Otros",
          count: 0,
          tienda: tiendaStr
        };
      }
      
      salesMap[key].count += v.cantidad;
      catMap[salesMap[key].category] = (catMap[salesMap[key].category] || 0) + v.cantidad;
      total += v.cantidad;
    }

    const topArr = Object.values(salesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(s => ({
        name: s.name.length > 20 ? s.name.substring(0, 20) + '...' : s.name,
        fullName: s.name,
        tienda: s.tienda,
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3 transition-colors">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
              <FileBarChart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            Panel de Analítica
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors max-w-xl">
            Monitorea el rendimiento de {store}, analiza ventas por categoría y controla productos en riesgo.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 text-base transition-colors">
              <SelectValue placeholder="Rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana" className="text-base py-3">Últimos 7 días</SelectItem>
              <SelectItem value="mes" className="text-base py-3">Últimos 30 días</SelectItem>
              <SelectItem value="global" className="text-base py-3">Histórico Global</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleGeneratePDF} 
            disabled={isGenerating || loadingSales}
            className="w-full sm:w-auto h-12 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold px-6 shadow-md transition-colors"
          >
            <Download className="h-5 w-5" />
            {isGenerating ? "Creando PDF..." : "Generar Reporte PDF"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Vendidos</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{loadingSales ? "-" : totalUnits} uds</h4>
          </div>
        </Card>
        
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <PackageOpen className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Categoría Estrella</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{loadingSales ? "-" : topCategory}</h4>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Lotes Críticos</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{criticos.length} alertas</h4>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2 transition-all">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 transition-colors">Top 10 Productos Más Vendidos</h3>
          <div className="h-[350px] w-full" id="chart-container">
            {loadingSales ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Cargando datos...</div>
            ) : topSold.length > 0 ? (
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
                    formatter={(value: number, name: string, props: any) => [`${value} uds`, props.payload.tienda]}
                  />
                  <Bar dataKey="vendidos" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                Aún no hay ventas registradas en este periodo
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
                  <tr key={lote.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
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
