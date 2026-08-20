import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center border border-emerald-500/20">
              <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Verificando sesión segura...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">FitHub Security Gateway</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sesión Requerida</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Para ver el inventario y las métricas operativas de FitHub, debes iniciar sesión con una cuenta autorizada.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Button asChild className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md gap-2">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                Ir a la Página Principal e Ingresar
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
