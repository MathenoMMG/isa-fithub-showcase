import { FlaskConical, RotateCcw } from "lucide-react";
import { IS_DEMO } from "@/lib/supabase";
import { resetDemoDatabase } from "@/lib/demo/mockSupabase";

/** Floating notice shown only in the public showcase build. */
export function DemoBadge() {
  if (!IS_DEMO) return null;

  const handleReset = () => {
    resetDemoDatabase();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-amber-300/60 bg-amber-50/95 dark:bg-amber-950/90 dark:border-amber-800 px-4 py-2 text-xs font-medium text-amber-900 dark:text-amber-100 shadow-lg backdrop-blur">
      <FlaskConical className="h-4 w-4 shrink-0" />
      <span>Modo demo · datos ficticios · sin autenticación</span>
      <button
        onClick={handleReset}
        className="flex items-center gap-1 rounded-full bg-amber-200/70 dark:bg-amber-800/60 px-2 py-0.5 hover:bg-amber-300/80 dark:hover:bg-amber-700 transition-colors cursor-pointer"
        title="Restaurar los datos de ejemplo"
      >
        <RotateCcw className="h-3 w-3" />
        Reiniciar
      </button>
    </div>
  );
}
