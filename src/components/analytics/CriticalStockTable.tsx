import { AlertTriangle, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatExpiryDate } from "@/lib/expiry";

export interface CriticalItem {
  id: string;
  tienda: string;
  nombre: string;
  caducidad: string;
  estado: "vencido" | "proximo";
  cantidad: number;
}

interface CriticalStockTableProps {
  criticos: CriticalItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectProduct: (nombre: string) => void;
}

export function CriticalStockTable({
  criticos,
  isExpanded,
  onToggleExpand,
  onSelectProduct,
}: CriticalStockTableProps) {
  return (
    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-amber-500" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Visor de Stock Crítico</h3>
      </div>
      
      <div className={`overflow-x-auto overflow-y-auto transition-all duration-300 ${isExpanded ? "max-h-none" : "max-h-[300px] scrollbar-thin"}`}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium">
            <tr>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Tienda</th>
              <th className="px-6 py-4">Caducidad</th>
              <th className="px-6 py-4 text-right">Uds.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {criticos.length > 0 ? (
              criticos.map((lote) => (
                <tr 
                  key={lote.id} 
                  onClick={() => onSelectProduct(lote.nombre)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    {lote.estado === "vencido" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        Vencido
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        Próximo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {lote.nombre}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{lote.tienda}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {formatExpiryDate(lote.caducidad)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    {lote.cantidad}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  No hay productos en estado crítico actualmente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {criticos.length > 5 && (
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
