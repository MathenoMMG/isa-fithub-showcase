import React from "react";
import { 
  CalendarClock, 
  ShieldCheck, 
  Store, 
  FileSpreadsheet, 
  Clock3, 
  Layers, 
  Zap, 
  Smartphone,
  Lock,
  CheckCircle2
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: CalendarClock,
      color: "from-emerald-500 to-teal-600",
      title: "Semáforo Proactivo de Caducidad",
      description: "Algoritmo en tiempo real que clasifica los lotes en Verde (óptimo), Amarillo (menos de 30 días) y Rojo (vencido) para garantizar una rotación eficiente y cero mermas.",
      badge: "Cero Desperdicios",
    },
    {
      icon: Store,
      color: "from-blue-500 to-cyan-600",
      title: "Gestión Dual Sur & Norte",
      description: "Alterna en un solo toque entre las dos sucursales principales de Ciudad Demo, visualizando el stock disponible, lotes activos y movimientos de inventario independientes.",
      badge: "Multi-Sede",
    },
    {
      icon: Clock3,
      color: "from-amber-500 to-orange-600",
      title: "Registro de Jornadas & Asistencia",
      description: "Módulo integrado para registrar ingresos, salidas y permanencia en punto de venta con hora oficial colombiana (Bogotá GMT-5) y trazabilidad completa.",
      badge: "Control Operativo",
    },
    {
      icon: FileSpreadsheet,
      color: "from-purple-500 to-indigo-600",
      title: "Exportación Ejecutiva a Excel",
      description: "Genera reportes .xlsx formateados con los filtros exactos de la vista activa para compartir informes consolidados con proveedores y gerencia.",
      badge: "Reportes 1-Click",
    },
    {
      icon: Smartphone,
      color: "from-rose-500 to-pink-600",
      title: "Diseño iPad-First & Táctil",
      description: "Botones amplios, controles de incremento rápido (mínimo 44px de área táctil) y modales cómodos optimizados para operar de pie en el punto de venta.",
      badge: "Touch Friendly",
    },
    {
      icon: Lock,
      color: "from-emerald-600 to-green-700",
      title: "Seguridad y Lista Blanca Cerrada",
      description: "Autenticación segura mediante Supabase Auth y validación criptográfica estricta con lista blanca exclusiva para los operadores autorizados.",
      badge: "100% Blindado",
    },
  ];

  return (
    <section id="caracteristicas" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
            Módulos & Herramientas
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            Todo lo necesario para la excelencia en el punto de venta
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Una plataforma pensada en la agilidad del día a día, eliminando errores manuales y agilizando la toma de decisiones.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg shadow-emerald-900/10`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {feature.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
