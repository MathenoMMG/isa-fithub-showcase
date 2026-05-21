import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/context/StoreContext";
import { Store } from "lucide-react";
import type { StoreFilter } from "@/types/inventory";

export function StoreSelector() {
  const { store, setStore } = useStore();
  return (
    <Select value={store} onValueChange={(v) => setStore(v as StoreFilter)}>
      <SelectTrigger className="h-12 min-w-[180px] rounded-xl border-slate-300 bg-white text-base font-medium">
        <Store className="h-4 w-4 mr-2 text-slate-500" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Ambas" className="text-base py-3">Ambas tiendas</SelectItem>
        <SelectItem value="Sur" className="text-base py-3">Sur</SelectItem>
        <SelectItem value="Norte" className="text-base py-3">Norte</SelectItem>
      </SelectContent>
    </Select>
  );
}
