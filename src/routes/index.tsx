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
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Resumen</h2>
        <p className="text-slate-500 mt-1">
          Mostrando datos de <span className="font-semibold text-slate-700">{store === "Ambas" ? "ambas tiendas" : store}</span>.
        </p>
      </div>

      <KpiCards items={filteredItems} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {store !== "Ambas" && (
          <Card className="p-6 rounded-2xl border-slate-200 bg-white flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <CalendarCheck className="h-7 w-7 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Control de Visita</h3>
                <p className="text-sm text-slate-500 mt-1">Marca el día que asistes a organizar esta tienda.</p>
              </div>
            </div>
            <div className="mt-auto pt-4">
              <Button
                onClick={handleVisit}
                disabled={alreadyVisited}
                className={`w-full h-11 text-white font-semibold rounded-xl ${
                  alreadyVisited ? "bg-slate-300 text-slate-500" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {alreadyVisited ? "Visita registrada hoy ✅" : "Registrar visita de hoy"}
              </Button>
            </div>
          </Card>
        )}

        <Link to="/inventario" className="group">
          <Card className="p-6 h-full rounded-2xl border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all bg-white flex flex-col justify-center">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Package className="h-7 w-7 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Gestionar Inventario</h3>
                <p className="text-sm text-slate-500 mt-1">Revisa stock, caducidades y añade lotes.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
            </div>
          </Card>
        </Link>

        <Link to="/horarios" className="group">
          <Card className="p-6 h-full rounded-2xl border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all bg-white flex flex-col justify-center">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Clock className="h-7 w-7 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Registrar Horario</h3>
                <p className="text-sm text-slate-500 mt-1">Marca tu entrada o salida del turno.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
