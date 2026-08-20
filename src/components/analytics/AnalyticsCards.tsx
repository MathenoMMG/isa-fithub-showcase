import { Card } from "@/components/ui/card";
import { Star, AlertCircle, Snail, BarChart3, CalendarDays, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import type { Venta, ProductoConLotes } from "@/types/inventory";
import {
  calculateRunRate,
  predictStockoutDays,
  getSlowMovers,
  getRestockSuggestions,
  getSalesByDayOfWeek,
} from "@/lib/analytics";
import { useMemo } from "react";
import { useProfile } from "@/context/ProfileContext";

interface CardProps {
  id: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  productos: ProductoConLotes[];
  ventas: Venta[];
}

function CardHeader({ title, icon: Icon, id, isFavorite, onToggleFavorite }: any) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      <button
        onClick={() => onToggleFavorite(id)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        title="Fijar al inicio"
      >
        <Star className={`h-5 w-5 ${isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
      </button>
    </div>
  );
}

import { useNavigate } from "@tanstack/react-router";

export function StockOutPredictionCard(props: CardProps) {
  const navigate = useNavigate();
  const { isDark, textColor, gridColor } = useThemeColors();
  const predictions = useMemo(() => {
    // Ultimos 7 dias para run rate
    const window = 7;
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() - window);

    const recentSales = props.ventas.filter(v => new Date(v.created_at) >= limit);
    const results = [];

    for (const p of props.productos) {
      const pSales = recentSales.filter(v => v.producto_id === p.id);
      const runRate = calculateRunRate(pSales, window);
      const stock = p.lotes.reduce((acc, l) => acc + l.cantidad, 0);
      const days = predictStockoutDays(stock, runRate);
      
      if (days !== null && days <= 7 && days > 0) { // Riesgo alto: se agota en 7 días o menos
        results.push({ producto: p.nombre, dias: days, stock, runRate: runRate.toFixed(1) });
      }
    }
    return results.sort((a, b) => a.dias - b.dias).slice(0, 5); // Top 5
  }, [props.ventas, props.productos]);

  return (
    <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
      <CardHeader title="Riesgo de Quiebre (Stock-out)" icon={AlertCircle} {...props} />
      <div className="flex-1 overflow-auto">
        {predictions.length > 0 ? (
          <ul className="space-y-3">
            {predictions.map((p, i) => (
              <li 
                key={i} 
                onClick={() => navigate({ to: "/inventario", search: { q: p.producto } })}
                className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div>
                  <p className="font-bold text-red-900 dark:text-red-200">{p.producto}</p>
                  <p className="text-xs text-red-700 dark:text-red-400">Stock: {p.stock} | Se venden {p.runRate}/día</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">En {p.dias} {p.dias === 1 ? 'día' : 'días'}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500 text-center px-4">
            No hay productos con riesgo inminente de agotarse (próximos 7 días).
          </div>
        )}
      </div>
    </Card>
  );
}

export function SlowMoversCard(props: CardProps) {
  const navigate = useNavigate();
  const movers = useMemo(() => getSlowMovers(props.productos, props.ventas, 14).slice(0, 5), [props.productos, props.ventas]);

  return (
    <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
      <CardHeader title="Atención: Productos Estancados" icon={Snail} {...props} />
      <div className="flex-1 overflow-auto">
        {movers.length > 0 ? (
          <ul className="space-y-3">
            {movers.map((m, i) => (
              <li 
                key={i} 
                onClick={() => navigate({ to: "/inventario", search: { q: m.producto.nombre } })}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-200 truncate max-w-[180px]" title={m.producto.nombre}>{m.producto.nombre}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Capital retenido (uds): {m.stockActual}</p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-500">+{m.diasSinVenta} días sin venta</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500 text-center px-4">
            Todo el catálogo se ha estado moviendo en los últimos 14 días.
          </div>
        )}
      </div>
    </Card>
  );
}

function useThemeColors() {
  const { theme } = useProfile();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const textColor = isDark ? "#94a3b8" : "#64748b"; // slate-400 : slate-500
  const gridColor = isDark ? "#334155" : "#e2e8f0"; // slate-700 : slate-200
  return { isDark, textColor, gridColor };
}

export function StoreComparisonCard(props: CardProps) {
  const { isDark, textColor, gridColor } = useThemeColors();
  
  const data = useMemo(() => {
    const cats: Record<string, { name: string, sur: number, norte: number, centro: number }> = {};
    for (const v of props.ventas) {
      if (!v.productos) continue;
      const cat = v.productos.categoria || "Otros";
      const tId = v.productos.tienda_id;
      
      if (!cats[cat]) cats[cat] = { name: cat, sur: 0, norte: 0, centro: 0 };
      if (tId === 2) cats[cat].sur += v.cantidad;
      else if (tId === 1) cats[cat].norte += v.cantidad;
      else if (tId === 3) cats[cat].centro += v.cantidad;
    }
    return Object.values(cats).sort((a, b) => (b.sur + b.norte + b.centro) - (a.sur + a.norte + a.centro)).slice(0, 6);
  }, [props.ventas]);

  return (
    <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[380px]">
      <CardHeader title="Comparativa Tiendas (Categoría)" icon={BarChart3} {...props} />
      <div className="flex-1 w-full min-h-0">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} tickLine={false} axisLine={{ stroke: gridColor }} />
              <YAxis tick={{ fontSize: 12, fill: textColor }} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                contentStyle={{ borderRadius: '12px', border: isDark ? '1px solid #334155' : 'none', backgroundColor: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }}
              />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar name="Norte" dataKey="norte" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar name="Sur" dataKey="sur" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar name="Centro" dataKey="centro" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin datos para comparar.</div>
        )}
      </div>
    </Card>
  );
}

export function HeatmapCard(props: CardProps) {
  const { isDark, textColor, gridColor } = useThemeColors();
  const data = useMemo(() => getSalesByDayOfWeek(props.ventas), [props.ventas]);

  return (
    <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[380px]">
      <CardHeader title="Picos de Venta (Día de la Semana)" icon={CalendarDays} {...props} />
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} tickLine={false} axisLine={{ stroke: gridColor }} />
            <YAxis tick={{ fontSize: 12, fill: textColor }} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: isDark ? '1px solid #334155' : 'none', backgroundColor: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }}
            />
            <Bar dataKey="value" name="Vendidos" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function RestockSuggestionCard(props: CardProps) {
  const navigate = useNavigate();
  const suggestions = useMemo(() => {
    // Tomar solo últimos 7 días
    const limit = new Date();
    limit.setDate(limit.getDate() - 7);
    const recent = props.ventas.filter(v => new Date(v.created_at) >= limit);
    return getRestockSuggestions(props.productos, recent).slice(0, 5); // Top 5
  }, [props.ventas, props.productos]);

  return (
    <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
      <CardHeader title="Sugerencia de Surtido (Próx. 7 días)" icon={ShoppingCart} {...props} />
      <div className="flex-1 overflow-auto">
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 mb-2">Basado en lo vendido en la última semana, te faltará:</div>
            {suggestions.map((s, i) => (
              <div 
                key={i} 
                onClick={() => navigate({ to: "/inventario", search: { q: s.producto.nombre } })}
                className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate" title={s.producto.nombre}>{s.producto.nombre}</p>
                  <p className="text-xs text-slate-500">Stock: {s.stockActual} (Vendido: {s.ventas7Dias})</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg font-bold text-sm">
                  Pedir {s.sugerido}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500 text-center px-4">
            El stock actual cubre las ventas proyectadas de todos los productos para los próximos 7 días.
          </div>
        )}
      </div>
    </Card>
  );
}
