import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, XCircle } from "lucide-react";
import { getExpiryStatus } from "@/lib/expiry";
import type { InventoryItem } from "@/types/inventory";

export function KpiCards({ items }: { items: InventoryItem[] }) {
  const total = items.length;
  const proximos = items.filter((i) => getExpiryStatus(i.fecha_caducidad) === "proximo").length;
  const vencidos = items.filter((i) => getExpiryStatus(i.fecha_caducidad) === "vencido").length;

  const cards = [
    {
      label: "Total de Productos",
      value: total,
      icon: Package,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
      accent: "border-slate-200",
    },
    {
      label: "Próximos a Vencer",
      value: proximos,
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      accent: "border-amber-200",
    },
    {
      label: "Vencidos",
      value: vencidos,
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
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
