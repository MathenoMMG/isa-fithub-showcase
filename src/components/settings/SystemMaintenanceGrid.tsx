import { RefreshCcw, RotateCcw, Download, Database, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SystemMaintenanceGridProps {
  isSyncing: boolean;
  onSync: () => void;
  onResetLocal: () => void;
  onExportBackup: () => void;
  onHardReset: () => void;
}

export function SystemMaintenanceGrid({
  isSyncing,
  onSync,
  onResetLocal,
  onExportBackup,
  onHardReset,
}: SystemMaintenanceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Sync Card */}
      <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all">
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Forzar Sincronización</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Descarga los datos más recientes de inventario y horarios desde la base de datos global.
            </p>
          </div>
          <div className="mt-auto pt-2">
            <Button
              onClick={onSync}
              disabled={isSyncing}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 transition-colors"
            >
              <RefreshCcw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando..." : "Sincronizar Datos"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Reset Card */}
      <Card className="p-6 rounded-2xl border-red-200 dark:border-red-900/30 bg-white dark:bg-slate-900 shadow-sm transition-all">
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Restablecer Ajustes Locales</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Borra únicamente tu foto de perfil, nombre y preferencias de tema de este dispositivo.
            </p>
          </div>
          <div className="mt-auto pt-2">
            <Button
              onClick={onResetLocal}
              variant="outline"
              className="w-full h-11 border-red-300 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 rounded-xl gap-2 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Borrar perfil local
            </Button>
          </div>
        </div>
      </Card>

      {/* Backup Global */}
      <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all">
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Exportar Backup Global</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Descarga un Excel con todo el inventario, turnos e historial de visitas guardado.
            </p>
          </div>
          <div className="mt-auto pt-2">
            <Button
              onClick={onExportBackup}
              variant="outline"
              className="w-full h-11 border-emerald-300 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-800 dark:hover:text-emerald-300 rounded-xl gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Descargar Backup (.xlsx)
            </Button>
          </div>
        </div>
      </Card>

      {/* Hard Reset Card */}
      <Card className="p-6 rounded-2xl border-red-200 dark:border-red-900/30 bg-white dark:bg-slate-900 shadow-sm transition-all">
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Limpieza Profunda
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Botón de emergencia. Borra toda la caché, forzando a la app a descargar todo desde cero.
            </p>
          </div>
          <div className="mt-auto pt-2">
            <Button
              onClick={onHardReset}
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 transition-colors font-bold"
            >
              <Database className="h-4 w-4" />
              Limpiar Toda la Caché
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
