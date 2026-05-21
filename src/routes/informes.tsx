import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileBarChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/lib/supabase";
import { generatePdfReport } from "@/lib/generate-report-pdf";

export const Route = createFileRoute("/informes")({
  head: () => ({
    meta: [{ title: "Informes · FitHub" }],
  }),
  component: Informes,
});

function Informes() {
  const { items } = useInventory();
  const { store } = useStore();
  const [range, setRange] = useState("semana");
  const [isGenerating, setIsGenerating] = useState(false);

  // We only show items from the selected store (or both)
  const filteredItems = useMemo(
    () => (store === "Ambas" ? items : items.filter((it) => it.tienda_nombre === store)),
    [items, store],
  );

  // Calculate top 10 most sold overall (from the Context's vendidos_total which is all-time for now)
  const topSold = useMemo(() => {
    return [...filteredItems]
      .sort((a, b) => b.vendidos_total - a.vendidos_total)
      .slice(0, 10)
      .map(p => ({
        name: p.nombre.length > 25 ? p.nombre.substring(0, 25) + '...' : p.nombre,
        vendidos: p.vendidos_total
      }));
  }, [filteredItems]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      let days = 7;
      if (range === "mes") days = 30;
      if (range === "global") days = 9999;
      
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);
      const isoLimit = dateLimit.toISOString();

      // Query sales for the range
      const { data: ventas, error } = await supabase
        .from("ventas")
        .select("*, productos(tienda_id, nombre, categoria)")
        .gte("created_at", isoLimit);
        
      if (error) throw error;

      // Filter by store
      const storeId = store === "Sur" ? 2 : store === "Norte" ? 1 : null;
      const filteredVentas = storeId 
        ? ventas?.filter(v => v.productos?.tienda_id === storeId)
        : ventas;

      await generatePdfReport({
        store,
        range,
        ventas: filteredVentas || [],
        inventory: filteredItems,
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-slate-500" />
            Informes y Analítica
          </h2>
          <p className="text-slate-500 mt-1">Genera reportes de ventas y revisa el desempeño de {store}.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[160px] h-11 bg-white">
              <SelectValue placeholder="Rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Últimos 7 días</SelectItem>
              <SelectItem value="mes">Últimos 30 días</SelectItem>
              <SelectItem value="global">Histórico Global</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleGeneratePDF} 
            disabled={isGenerating}
            className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold"
          >
            <Download className="h-5 w-5" />
            {isGenerating ? "Generando..." : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Productos Chart */}
        <Card className="p-6 rounded-2xl border-slate-200 bg-white lg:col-span-2 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top 10 Más Vendidos (Global)</h3>
          <div className="h-[300px] w-full" id="chart-container">
            {topSold.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSold} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "#64748b" }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="vendidos" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Aún no hay ventas registradas
              </div>
            )}
          </div>
        </Card>

        {/* Info panel */}
        <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Métricas del PDF</h3>
          <ul className="space-y-4 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">1</div>
              <span>Total de unidades vendidas en el periodo seleccionado.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">2</div>
              <span>Tabla con el top de productos más vendidos detallando cantidades.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">3</div>
              <span>Lista de stock crítico (productos vencidos o próximos a vencer en menos de 30 días).</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
