import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StoreSelector } from "./StoreSelector";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/inventario": "Inventario",
  "/horarios": "Registro de Horarios",
  "/ajustes": "Ajustes",
};

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titles[pathname] ?? "FitHub";

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-4 md:px-6">
      <SidebarTrigger className="h-11 w-11" />
      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">{title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          {format(now, "EEEE d 'de' MMMM · HH:mm", { locale: es })}
        </p>
      </div>
      <StoreSelector />
      <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200">
        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
          MI
        </div>
        <div className="text-sm">
          <div className="font-medium text-slate-900 leading-tight">Mercaimpulsadora</div>
          <div className="text-xs text-slate-500">FitHub Ciudad Demo</div>
        </div>
      </div>
    </header>
  );
}
