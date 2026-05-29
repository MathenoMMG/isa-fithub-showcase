import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/context/StoreContext";
import { Store } from "lucide-react";
import type { StoreFilter } from "@/types/inventory";
import { useProfile } from "@/context/ProfileContext";

export function StoreSelector() {
  const { store, setStore } = useStore();
  const { profile } = useProfile();

  const isPremium = profile.stylePreset === "obsidian";

  return (
    <Select value={store} onValueChange={(v) => setStore(v as StoreFilter)}>
      <SelectTrigger 
        className={
          isPremium 
            ? "h-10 w-[160px] px-2.5 rounded-[3px] border border-border bg-card/30 text-xs font-mono dark:bg-slate-900/30 dark:border-primary/5 dark:text-slate-200 transition-all uppercase tracking-wider"
            : "h-12 w-[170px] px-2 rounded-xl border-slate-300 bg-white text-base font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 transition-colors"
        }
      >
        <Store className={`h-4 w-4 mr-1.5 ${isPremium ? "text-primary dark:text-emerald-400 h-3.5 w-3.5" : "text-slate-500"}`} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={isPremium ? "font-mono text-xs uppercase" : ""}>
        <SelectItem value="Ambas" className={isPremium ? "text-xs py-2 uppercase" : "text-base py-3"}>
          {isPremium ? "SYS_ALL" : "Ambas tiendas"}
        </SelectItem>
        <SelectItem value="Sur" className={isPremium ? "text-xs py-2 uppercase" : "text-base py-3"}>
          Sur
        </SelectItem>
        <SelectItem value="Norte" className={isPremium ? "text-xs py-2 uppercase" : "text-base py-3"}>
          Norte
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
