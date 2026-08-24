import { AlertOctagon, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatInBogota } from "@/lib/date-utils";
import type { Merma, ProductoConLotes } from "@/types/inventory";

interface MermasHistoryTableProps {
  mermas: Merma[];
  items: ProductoConLotes[];
  totalUnits: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUndoMerma: (mermaId: string) => void;
}

export function MermasHistoryTable({
  mermas,
  items,
  totalUnits,
  isExpanded,
  onToggleExpand,
  onUndoMerma,
}: MermasHistoryTableProps) {
  const TIENDA_NAMES: Record<number, string> = { 1: "Norte", 2: "Sur", 3: "Centro" };

  return (
    <Card id="registro-mermas" className="rounded-[12px] border-[0.5px] border-red-200 dark:border-red-950/50 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <AlertOctagon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Registro de Mermas y Pérdidas</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                -{totalUnits} uds
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control de pérdidas físicas por vencimiento, bodega o avería</p>
          </div>
        </div>
      </div>

      <div className={`overflow-x-auto overflow-y-auto transition-all duration-300 ${isExpanded ? "max-h-none" : "max-h-[300px] scrollbar-thin"}`}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            <tr>
              <th className="px-6 py-4">Fecha y Hora</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Tienda</th>
              <th className="px-6 py-4">Motivo Tipificado</th>
              <th className="px-6 py-4">Notas</th>
              <th className="px-6 py-4 text-right">Cantidad</th>
              <th className="px-6 py-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {mermas.length > 0 ? (
              mermas.map((m) => {
                const prod = items.find((p) => p.id === m.producto_id);

                let motivoLabel = "Caducidad";
                let motivoBadgeColor = "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";
                if (m.motivo === "perdida_bodega") {
                  motivoLabel = "Pérdida en bodega";
                  motivoBadgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400";
                } else if (m.motivo === "averia") {
                  motivoLabel = "Avería / Empaque";
                  motivoBadgeColor = "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400";
                } else if (m.motivo === "descuadre") {
                  motivoLabel = "Descuadre conteo";
                  motivoBadgeColor = "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
                }

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatInBogota(m.created_at, "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                      {prod?.nombre || "Producto"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {TIENDA_NAMES[m.tienda_id] || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${motivoBadgeColor}`}>
                        {motivoLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {m.notas || "-"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                      -{m.cantidad}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUndoMerma(m.id)}
                        className="h-7 px-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                        title="Restaurar stock y deshacer merma"
                      >
                        Deshacer
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  No se registran mermas ni pérdidas en el rango y tiendas seleccionadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {mermas.length > 5 && (
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all select-none flex items-center gap-1.5 active:scale-95 duration-200"
            onClick={onToggleExpand}
          >
            <span>{isExpanded ? "Contraer Tabla" : "Ampliar Tabla"}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
      )}
    </Card>
  );
}
