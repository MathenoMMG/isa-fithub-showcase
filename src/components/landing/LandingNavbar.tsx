import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/auth/LoginModal";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Sun, Moon, Layers, Lock } from "lucide-react";

export function LandingNavbar() {
  const { isAuthenticated, signOut } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fithub_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fithub_theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - Generic SaaS */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-700/20 group-hover:scale-105 transition-transform overflow-hidden p-2 text-white border border-emerald-400/30">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-50">
                StockSync
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                Enterprise
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Control de Inventario & Punto de Venta
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#caracteristicas" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Módulos
          </a>
          <a href="#vista-previa" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Demostración
          </a>
          <a href="#seguridad" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Seguridad
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                asChild
                className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Link to="/dashboard">
                  <span>Ir al Panel</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="h-11 px-4 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Salir
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setLoginModalOpen(true)}
              className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>Ingresar</span>
            </Button>
          )}

          <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
        </div>

      </div>
    </header>
  );
}
