import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/context/StoreContext";
import { useInventory } from "@/context/InventoryContext";
import { useTimeLog } from "@/context/TimeLogContext";
import { toast } from "sonner";
import type { StoreFilter } from "@/types/inventory";
import { RotateCcw } from "lucide-react";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes · FitHub" },
      { name: "description", content: "Preferencias de la aplicación." },
    ],
  }),
  component: AjustesPage,
});

function AjustesPage() {
  const { store, setStore } = useStore();
  const { resetData } = useInventory();
  const { clearLogs } = useTimeLog();

  const handleReset = () => {
    resetData();
    clearLogs();
    toast.success("Datos locales restablecidos");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Ajustes</h2>
        <p className="text-slate-500 mt-1">Preferencias de la aplicación.</p>
      </div>

      <Card className="p-6 rounded-2xl border-slate-200 bg-white shadow-sm space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Tienda predeterminada</h3>
        <p className="text-sm text-slate-500">Define qué tienda se muestra al abrir la app.</p>
        <Select value={store} onValueChange={(v) => setStore(v as StoreFilter)}>
          <SelectTrigger className="h-12 rounded-xl border-slate-300 text-base max-w-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ambas" className="text-base py-3">Ambas tiendas</SelectItem>
            <SelectItem value="Sur" className="text-base py-3">Sur</SelectItem>
            <SelectItem value="Norte" className="text-base py-3">Norte</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6 rounded-2xl border-red-200 bg-white shadow-sm space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Restablecer datos locales</h3>
        <p className="text-sm text-slate-500">
          Borra todos los cambios de inventario y registros de horario guardados en este dispositivo.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="h-12 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restablecer datos
        </Button>
      </Card>
    </div>
  );
}
