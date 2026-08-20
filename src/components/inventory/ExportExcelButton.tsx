import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportInventoryToExcel } from "@/lib/export-xlsx";
import type { InventoryItem } from "@/types/inventory";
import { useInventory } from "@/context/InventoryContext";

export function ExportExcelButton({ items }: { items: InventoryItem[] }) {
  const { mermas } = useInventory();

  return (
    <Button
      onClick={() => exportInventoryToExcel(items, mermas)}
      className="h-12 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold gap-2 rounded-xl shadow-sm"
    >
      <Download className="h-5 w-5" />
      Exportar a Excel
    </Button>
  );
}
