import { TrendingUp, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatInBogota } from "@/lib/date-utils";

export interface SaleTableItem {
  id: string;
  created_at: string;
  cantidad: number;
  productos?: {
    nombre: string;
    tienda_id: number;
  } | null;
}

interface SalesHistoryTableProps {
  sales: SaleTableItem[];
  range: string;
  salesDateFilter: string;
  isExpanded: boolean;
  onRangeChange: (range: string) => void;
  onDateFilterChange: (date: string) => void;
  onToggleExpand: () => void;
  onSelectProduct: (nombre: string) => void;
}

export function SalesHistoryTable({
  sales,
  range,
  salesDateFilter,
  isExpanded,
  onRangeChange,
  onDateFilterChange,
  onToggleExpand,
  onSelectProduct,
}: SalesHistoryTableProps) {
  return (
    <Card id="registro-ventas" className="rounded-[12px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Registro de Ventas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Historial detallado del rango seleccionado</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 px-3 text-xs rounded-md transition-all ${range === 'semana' && !salesDateFilter ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              onClick={() => { onRangeChange("semana"); onDateFilterChange(""); }}
            >
              Semana
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 px-3 text-xs rounded-md transition-all ${range === 'mes' && !salesDateFilter ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              onClick={() => { onRangeChange("mes"); onDateFilterChange(""); }}
            >
              Mes
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Día:</span>
            <Input 
              type="date"
              value={salesDateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="h-9 w-[150px] dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
            />
            {salesDateFilter && (
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500" onClick={() => onDateFilterChange("")}>
                <X className="h-4 w-4" />
              </Button>
            )}
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
              <th className="px-6 py-4 text-right">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sales.length > 0 ? (
              sales.map((v) => (
                <tr 
                  key={v.id} 
                  onClick={() => v.productos?.nombre && onSelectProduct(v.productos.nombre)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {formatInBogota(v.created_at, "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                    {v.productos?.nombre || "Producto desconocido"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {v.productos?.tienda_id === 1 ? "Norte" : v.productos?.tienda_id === 2 ? "Sur" : v.productos?.tienda_id === 3 ? "Centro" : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    +{v.cantidad}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  No se encontraron registros de ventas para el filtro seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sales.length > 5 && (
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
