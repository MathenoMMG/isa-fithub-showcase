import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, XCircle } from "lucide-react";
import { countLotesByStatus, getTotalQty } from "@/lib/expiry";
import type { InventoryItem } from "@/types/inventory";

export function KpiCards({ items }: { items: InventoryItem[] }) {
  const allLotes = items.flatMap((i) => i.lotes);
  const totalUnidades = getTotalQty(allLotes);
  const { proximos, vencidos } = countLotesByStatus(allLotes);

  const cards = [
    {
      label: "Unidades en stock",
      value: totalUnidades,
      hint: `${items.length} productos · ${allLotes.length} lotes`,
      icon: Package,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
      accent: "border-slate-200",
    },
    {
      label: "Lotes próximos a vencer",
      value: proximos,
      hint: "≤ 30 días",
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      accent: "border-amber-200",
    },
    {
      label: "Lotes vencidos",
      value: vencidos,
      hint: "Retirar de góndola",
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      accent: "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className={`p-6 border ${c.accent} rounded-2xl bg-white shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl ${c.iconBg} flex items-center justify-center`}>
                <Icon className={`h-7 w-7 ${c.iconColor}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">{c.label}</div>
                <div className="text-3xl font-bold text-slate-900 tabular-nums">{c.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{c.hint}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
