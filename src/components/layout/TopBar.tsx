import { useEffect, useState } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StoreSelector } from "./StoreSelector";
import { formatInBogota } from "@/lib/date-utils";
import { useProfile } from "@/context/ProfileContext";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { getPendingOps, processPendingOp, removePendingOp, type PendingOp } from "@/lib/offline";
import { toast } from "sonner";

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
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOps, setPendingOps] = useState<PendingOp[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(window.navigator.onLine);
    setPendingOps(getPendingOps());

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("¡Conexión de red restaurada! Ya puedes guardar tus cambios pendientes.");
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Sin conexión a internet. Los cambios se guardarán localmente.");
    };

    const handleOpsChanged = () => {
      setPendingOps(getPendingOps());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("fithub_pending_ops_changed", handleOpsChanged);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("fithub_pending_ops_changed", handleOpsChanged);
    };
  }, []);

  const handleSync = async () => {
    if (pendingOps.length === 0 || isSyncing) return;
    setIsSyncing(true);
    
    const toastId = toast.loading(`Sincronizando ${pendingOps.length} cambios pendientes...`);
    const opsToSync = [...pendingOps];
    let successCount = 0;

    for (const op of opsToSync) {
      try {
        await processPendingOp(op);
        removePendingOp(op.id);
        successCount++;
      } catch (err) {
        console.error("Error syncing pending operation:", op, err);
      }
    }

    setIsSyncing(false);
    
    if (successCount === opsToSync.length) {
      toast.success("¡Todos los cambios se han guardado con éxito!", { id: toastId });
      // Recargar la página para rehidratar todo el estado limpio desde Supabase
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      toast.error(`Sincronización parcial: ${successCount} de ${opsToSync.length} cambios guardados.`, { id: toastId });
    }
  };

  const initials = profile.name ? profile.name.substring(0, 2).toUpperCase() : "FH";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-4 md:px-6 transition-colors">
      <SidebarTrigger className="h-11 w-11 dark:text-slate-200" />
      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-50 truncate">{title}</h1>
      </div>

      {/* Indicador de conexión */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shrink-0">
        <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline">
          {isOnline ? 'En línea' : 'Sin red'}
        </span>
      </div>

      {/* Botón de sincronización cuando vuelve el internet */}
      {isOnline && pendingOps.length > 0 && (
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold gap-2 rounded-xl shadow-md animate-bounce cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Guardar Cambios ({pendingOps.length})</span>
        </Button>
      )}
      
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
            {formatInBogota(now, "d MMM · HH:mm")}
          </div>
        </div>
      </Link>
    </header>
  );
}
