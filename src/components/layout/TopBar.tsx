import { useEffect, useState } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StoreSelector } from "./StoreSelector";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useProfile } from "@/context/ProfileContext";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/inventario": "Inventario",
  "/horarios": "Registro de Horarios",
  "/ajustes": "Ajustes",
  "/informes": "Informes",
};

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titles[pathname] ?? "FitHub";
  const { profile } = useProfile();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const initials = profile.name ? profile.name.substring(0, 2).toUpperCase() : "FH";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-4 md:px-6 transition-colors">
      <SidebarTrigger className="h-11 w-11 dark:text-slate-200" />
      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50 truncate">{title}</h1>
      </div>
      
      <StoreSelector />
      
      <Link to="/ajustes" className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800 transition-all hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-900/50 p-1.5 rounded-xl cursor-pointer">
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold tracking-tight shadow-sm">
            {initials}
          </div>
        )}
        <div className="text-sm">
          <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[150px]">
            {profile.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
            {profile.subtitle}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            {format(now, "d MMM · HH:mm", { locale: es })}
          </div>
        </div>
      </Link>
    </header>
  );
}
