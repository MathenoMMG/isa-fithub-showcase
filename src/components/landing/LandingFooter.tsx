import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/components/auth/LoginModal";
import { ShieldCheck, Lock, ArrowUp } from "lucide-react";

export function LandingFooter() {
  const { isAuthenticated } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <footer id="seguridad" className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center p-1.5 shadow-md">
                <img src="/isa.svg" alt="FitHub Logo" className="h-full w-full object-contain filter brightness-0 invert" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                FitHub Manager
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Sistema integral privado para el control de inventario, semáforo de fechas de caducidad, registro de asistencia y reportería comercial en Ciudad Demo.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistema protegido bajo Supabase Auth v2</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#caracteristicas" className="hover:text-emerald-400 transition-colors">
                  Capacidades del Sistema
                </a>
              </li>
              <li>
                <a href="#vista-previa" className="hover:text-emerald-400 transition-colors">
                  Demostración Interactiva
                </a>
              </li>
              <li>
                <a href="#seguridad" className="hover:text-emerald-400 transition-colors">
                  Protocolo de Seguridad
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Access */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Acceso</h4>
            <ul className="space-y-2.5 text-sm">
              {isAuthenticated ? (
                <li>
                  <Link to="/dashboard" className="text-emerald-400 hover:underline font-semibold">
                    Ir al Panel de Control →
                  </Link>
                </li>
              ) : (
                <li>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="text-emerald-400 hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" /> Iniciar Sesión
                  </button>
                </li>
              )}
              <li className="text-xs text-slate-500 pt-1">
                Acceso restringido exclusivamente a correos registrados en lista blanca.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} FitHub Ciudad Demo. Todos los derechos reservados.
          </div>
          <div>
            Plataforma desarrollada para gestión comercial & mercaimpulsación.
          </div>
        </div>

      </div>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </footer>
  );
}
