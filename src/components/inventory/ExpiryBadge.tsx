import { Badge } from "@/components/ui/badge";
import { getDaysUntilExpiry, getExpiryStatus } from "@/lib/expiry";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function ExpiryBadge({ fecha }: { fecha: string }) {
  const status = getExpiryStatus(fecha);
  const days = getDaysUntilExpiry(fecha);

  if (status === "vencido") {
    return (
      <Badge className="bg-red-600 hover:bg-red-600 text-white gap-1.5 px-3 py-1.5 text-sm font-medium">
        <XCircle className="h-4 w-4" />
        Vencido
      </Badge>
    );
  }
  if (status === "proximo") {
    return (
      <Badge className="bg-amber-500 hover:bg-amber-500 text-white gap-1.5 px-3 py-1.5 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        {days} {days === 1 ? "día restante" : "días restantes"}
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1.5 px-3 py-1.5 text-sm font-medium">
      <CheckCircle2 className="h-4 w-4" />
      En regla
    </Badge>
  );
}
