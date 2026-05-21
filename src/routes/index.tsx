import { createFileRoute, Link } from "@tanstack/react-router";
import { KpiCards } from "@/components/inventory/KpiCards";
import { useInventory } from "@/context/InventoryContext";
import { Card } from "@/components/ui/card";
import { Package, Clock, ArrowRight, CalendarCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useVisitas } from "@/context/VisitContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · FitHub" },
      { name: "description", content: "Resumen de inventario y accesos rápidos." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { filteredItems } = useInventory();
  const { store } = useStore();
  const { registrarVisita, visitas } = useVisitas();
  const storeId = store === "Sur" ? 2 : 1;

  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyVisited = visitas.some((v) => v.tienda_id === storeId && v.fecha === todayStr);

  const handleVisit = async () => {
    try {
      await registrarVisita(storeId, todayStr);
      toast.success(`Visita registrada hoy para ${store}`);
    } catch (err) {
      toast.error("Error al registrar la visita");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Resumen</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Mostrando datos de <span className="font-semibold text-slate-700 dark:text-slate-300">{store === "Ambas" ? "ambas tiendas" : store}</span>.
          </p>
        </div>

        {store !== "Ambas" && (
          <Button
            onClick={handleVisit}
            disabled={alreadyVisited}
            variant="outline"
            className={`h-12 px-6 rounded-xl font-bold transition-all shadow-sm ${
              alreadyVisited
                ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 dark:bg-slate-900 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20"
            }`}
          >
            <CalendarCheck className="h-5 w-5 mr-2" />
            {alreadyVisited ? "Jornada Registrada" : "Marcar Jornada Aquí"}
          </Button>
        )}
      </div>

      <KpiCards items={filteredItems} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <Link to="/inventario" className="group">
          <Card className="p-6 h-full rounded-2xl border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col justify-center">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <Package className="h-7 w-7 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Gestionar Inventario</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revisa stock, caducidades y añade lotes.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Card>
        </Link>

        <Link to="/horarios" className="group">
          <Card className="p-6 h-full rounded-2xl border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col justify-center">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <Clock className="h-7 w-7 text-slate-700 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Registrar Horario</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Marca tu entrada o salida del turno.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
