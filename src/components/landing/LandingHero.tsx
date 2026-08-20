import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/auth/LoginModal";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Store, Calendar, FileSpreadsheet, Lock } from "lucide-react";

export function LandingHero() {
  const { isAuthenticated } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Plataforma Operativa de Gestión y Punto de Venta</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 max-w-4xl mx-auto leading-[1.12]">
          Control inteligente de <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">inventarios y rotación</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Diseñada para optimizar el control de stock en las sucursales de <strong className="text-slate-900 dark:text-slate-100 font-semibold">Sur</strong> y <strong className="text-slate-900 dark:text-slate-100 font-semibold">Norte</strong>, alertando en tiempo real sobre fechas de vencimiento y jornadas operativas.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Button
              asChild
              className="w-full sm:w-auto h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/25 text-base gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Link to="/dashboard">
                <span>Acceder al Panel de Control</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              onClick={() => setLoginModalOpen(true)}
              className="w-full sm:w-auto h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/25 text-base gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Lock className="h-5 w-5" />
              <span>Ingresar al Sistema</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}

          <a
            href="#vista-previa"
            className="w-full sm:w-auto h-14 px-8 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold rounded-2xl shadow-sm text-base flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            Explorar Demostración
          </a>
        </div>

        {/* Key Highlights / Trust Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">2 Sedes</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Sur & Norte</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">&lt; 30 Días</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Semáforo de Alertas</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">Excel .xlsx</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Exportación Inmediata</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100% Cloud</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Seguridad Supabase</div>
          </div>
        </div>

      </div>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </section>
  );
}
