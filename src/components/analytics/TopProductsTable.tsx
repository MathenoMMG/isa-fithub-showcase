import React from "react";
import { TrendingUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface TopProductItem {
  id: string;
  nombre: string;
  sku: string;
  categoria: string;
  vendidos: number;
  tienda_id: number;
}

interface TopProductsTableProps {
  topProducts: TopProductItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectProduct: (nombre: string) => void;
}

export function TopProductsTable({
  topProducts,
  isExpanded,
  onToggleExpand,
  onSelectProduct,
}: TopProductsTableProps) {
  return (
    <Card className="rounded-[12px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
          <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Top 10 Productos Más Vendidos</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Los artículos con mayor volumen de ventas registradas en el rango seleccionado</p>
        </div>
      </div>

      <div className={`overflow-x-auto overflow-y-auto transition-all duration-300 ${isExpanded ? "max-h-none" : "max-h-[300px] scrollbar-thin"}`}>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            <tr>
              <th className="px-6 py-4 w-20 text-center">Puesto</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">SKU / Artículo</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Tienda</th>
              <th className="px-6 py-4 text-right">Uds. Vendidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {topProducts.length > 0 ? (
              topProducts.map((p, index) => {
                let rankBadge: React.ReactNode;
                
                if (index === 0) {
                  rankBadge = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-xs">🥇</span>;
                } else if (index === 1) {
                  rankBadge = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs">🥈</span>;
                } else if (index === 2) {
                  rankBadge = <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 font-bold text-xs">🥉</span>;
                } else {
                  rankBadge = <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">#{index + 1}</span>;
                }

                return (
                  <tr 
                    key={p.id}
                    onClick={() => onSelectProduct(p.nombre)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-center font-medium">{rankBadge}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {p.nombre}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{p.sku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {p.tienda_id === 1 ? "Norte" : p.tienda_id === 2 ? "Sur" : p.tienda_id === 3 ? "Centro" : "General"}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                      {p.vendidos} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">uds</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  No se registran ventas en este periodo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {topProducts.length > 5 && (
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
