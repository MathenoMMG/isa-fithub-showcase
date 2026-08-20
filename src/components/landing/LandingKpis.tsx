import React from "react";
import { 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  ArrowUpRight, 
  Layers, 
  Sparkles,
  PieChart,
  Percent
} from "lucide-react";

export function LandingKpis() {
  const kpis = [
    {
      title: "Índice de Rotación FIFO",
      value: "96.4%",
      change: "+14.2% vs manual",
      description: "Porcentaje de lotes más antiguos despachados prioritariamente.",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/60",
      border: "border-emerald-200 dark:border-emerald-800/80",
    },
    {
      title: "Prevención de Mermas",
      value: "-94.8%",
      change: "0 productos vencidos",
      description: "Reducción de pérdidas por caducidad gracias al semáforo a 30 días.",
      icon: ShieldAlert,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/60",
      border: "border-blue-200 dark:border-blue-800/80",
    },
    {
      title: "Control de Jornadas",
      value: "99.2%",
      change: "Puntualidad en punto",
      description: "Registro de asistencia y cálculo de permanencia en tienda en tiempo real.",
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/60",
      border: "border-purple-200 dark:border-purple-800/80",
    },
    {
      title: "Eficiencia de Auditoría",
      value: "< 3 min",
      change: "Exportación .xlsx instantánea",
      description: "Tiempo promedio de consolidación de reportes para gerencia y marcas.",
      icon: BarChart3,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/60",
      border: "border-amber-200 dark:border-amber-800/80",
    },
  ];

  const categoryBreakdown = [
    { name: "Línea Saludable A", pct: 38, stock: "340 uds", color: "bg-emerald-500" },
    { name: "Snacks & Repostería", pct: 27, stock: "245 uds", color: "bg-teal-500" },
    { name: "Bebidas Funcionales", pct: 21, stock: "190 uds", color: "bg-cyan-500" },
    { name: "Otros & Suplementos", pct: 14, stock: "125 uds", color: "bg-slate-400" },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-50/80 dark:bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-300/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Telemetría & Analítica de Rendimiento</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Métricas de Alto Impacto en Tiempo Real
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Monitorea el comportamiento del stock y la rotación en punto de venta con indicadores diseñados para la toma ágil de decisiones comerciales.
          </p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border ${kpi.border} shadow-sm hover:shadow-lg transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {kpi.change}
                </span>
              </div>

              <div className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                {kpi.value}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {kpi.title}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {kpi.description}
              </p>
            </div>
          ))}
        </div>

        {/* Analytical Breakdown Showcase (Simulated) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Box 1: Category Distribution Simulation */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Distribución de Stock por Categoría
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Balance operativo de inventario activo
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Demo Live</span>
            </div>

            <div className="space-y-4">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{cat.stock} ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Capacidad total estimada: 900 unidades</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Nivel Óptimo</span>
            </div>
          </div>

          {/* Box 2: Multi-Branch Health Check Simulation */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    Estado de Salud por Punto de Venta
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Comparativa de cumplimiento y control de caducidades
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Simulación</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Sucursal Norte</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">98% Eficiencia</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between"><span>Lotes en regla:</span> <strong className="text-emerald-600">95%</strong></div>
                    <div className="flex justify-between"><span>Alertas tempranas:</span> <strong className="text-amber-500">2 lotes</strong></div>
                    <div className="flex justify-between"><span>Jornada de hoy:</span> <strong className="text-slate-900 dark:text-slate-100">Completada</strong></div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Sucursal Centro</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">99% Eficiencia</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between"><span>Lotes en regla:</span> <strong className="text-emerald-600">98%</strong></div>
                    <div className="flex justify-between"><span>Alertas tempranas:</span> <strong className="text-amber-500">1 lote</strong></div>
                    <div className="flex justify-between"><span>Jornada de hoy:</span> <strong className="text-slate-900 dark:text-slate-100">Completada</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              📊 Indicadores demostrativos generados para visualización pública.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
