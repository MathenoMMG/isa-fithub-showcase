import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, XCircle } from "lucide-react";
import { countLotesByStatus, getTotalQty } from "@/lib/expiry";
import type { InventoryItem } from "@/types/inventory";

export function KpiCards({ 
  items,
  activeFilters = [],
  onFilterStock,
  onFilterProximos,
  onFilterVencidos
}: { 
  items: InventoryItem[];
  activeFilters?: string[];
  onFilterStock?: () => void;
  onFilterProximos?: () => void;
  onFilterVencidos?: () => void;
}) {
  const allLotes = items.flatMap((i) => i.lotes);
  const totalUnidades = getTotalQty(allLotes);
  const { proximos, vencidos } = countLotesByStatus(allLotes);

  const cards = [
    {
      id: "stock",
      label: "Unidades en stock",
      value: totalUnidades,
      hint: `${items.length} productos · ${allLotes.length} lotes`,
      icon: Package,
      iconBg: "bg-slate-100 dark:bg-slate-800",
      iconColor: "text-slate-700 dark:text-slate-300",
      accent: "border-slate-200 dark:border-slate-800",
      activeClass: "ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700",
      onClick: onFilterStock
    },
    {
      id: "proximo",
      label: "Lotes próximos a vencer",
      value: proximos,
      hint: "≤ 30 días",
      icon: AlertTriangle,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      accent: "border-amber-200 dark:border-amber-900/50",
      activeClass: "ring-2 ring-amber-500 bg-amber-50/30 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700",
      onClick: onFilterProximos
    },
    {
      id: "vencido",
      label: "Lotes vencidos",
      value: vencidos,
      hint: "Retirar de góndola",
      icon: XCircle,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      accent: "border-red-200 dark:border-red-900/50",
      activeClass: "ring-2 ring-red-500 bg-red-50/30 dark:bg-red-900/20 border-red-300 dark:border-red-700",
      onClick: onFilterVencidos
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activeFilters.includes(c.id);
        return (
          <Card 
            key={c.id} 
            className={`p-6 rounded-2xl transition-all shadow-sm ${c.onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''} ${isActive ? c.activeClass : `bg-white dark:bg-slate-900 border ${c.accent}`}`}
            onClick={c.onClick}
          >
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl ${c.iconBg} flex items-center justify-center`}>
                <Icon className={`h-7 w-7 ${c.iconColor}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{c.value}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{c.hint}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
