import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import { useInventory } from "@/context/InventoryContext";

const DEFAULT_CATEGORIAS = ["Arepas", "Lácteos", "Snacks", "Bebidas", "Suplementos", "Despensa", "Panadería", "Cereales", "Confitería", "Quesos", "Frutos y Nueces", "Accesorios", "Otros"];

export function CategoryManagerDialog() {
  const { filteredItems, updateProductCategories } = useInventory();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [customCategories, setCustomCategories] = useState<Record<string, string>>({});

  // Reset state when opened
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setChanges({});
      setCustomCategories({});
      setSearch("");
    }
  };

  const allCategorias = useMemo(() => {
    const existing = filteredItems.map(i => i.categoria).filter(Boolean);
    const unique = Array.from(new Set([...DEFAULT_CATEGORIAS, ...existing]));
    return unique.sort();
  }, [filteredItems]);

  const visibleItems = useMemo(() => {
    if (!search.trim()) return filteredItems;
    const q = search.toLowerCase();
    return filteredItems.filter(it => 
      (it.nombre || "").toLowerCase().includes(q) ||
      (it.articulo || "").toLowerCase().includes(q)
    );
  }, [filteredItems, search]);

  const handleSave = async () => {
    // Merge custom categories into changes where applicable
    const finalUpdates: Record<string, string> = {};
    for (const [id, val] of Object.entries(changes)) {
      if (val === "NEW") {
        const custom = customCategories[id];
        if (custom && custom.trim() !== "") {
          finalUpdates[id] = custom.trim();
        } else {
          // Fallback to original if they selected NEW but wrote nothing
          finalUpdates[id] = filteredItems.find(i => i.id === id)?.categoria || "";
        }
      } else {
        finalUpdates[id] = val;
      }
    }
    
    // Filter out ones that haven't actually changed
    const actualUpdates: Record<string, string> = {};
    for (const [id, val] of Object.entries(finalUpdates)) {
      if (val && val !== filteredItems.find(i => i.id === id)?.categoria) {
        actualUpdates[id] = val;
      }
    }

    if (Object.keys(actualUpdates).length === 0) {
      toast.info("No hay cambios para guardar.");
      setOpen(false);
      return;
    }

    try {
      await updateProductCategories(actualUpdates);
      toast.success(`Se actualizaron ${Object.keys(actualUpdates).length} categorías exitosamente.`);
      setOpen(false);
    } catch (err) {
      toast.error("Error al actualizar las categorías.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 border-dashed bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl">
          <Edit className="mr-2 h-4 w-4" />
          Edición Rápida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Edición Masiva de Categorías</DialogTitle>
        </DialogHeader>
        
        <div className="relative my-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto a modificar..."
            className="pl-9 h-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {visibleItems.map(item => {
            const currentCat = changes[item.id] !== undefined ? changes[item.id] : (item.categoria || DEFAULT_CATEGORIAS[0]);
            const isNew = currentCat === "NEW";

            return (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{item.nombre}</div>
                  <div className="text-xs text-slate-500">SKU: {item.articulo} · {item.tienda_nombre}</div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select 
                    value={currentCat} 
                    onValueChange={(val) => setChanges(prev => ({ ...prev, [item.id]: val }))}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-9 bg-white dark:bg-slate-950">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      <SelectItem value="NEW" className="text-emerald-600 font-medium">Crear nueva...</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {isNew && (
                    <Input 
                      className="h-9 w-[140px]" 
                      placeholder="Nueva cat." 
                      value={customCategories[item.id] || ""}
                      onChange={(e) => setCustomCategories(prev => ({ ...prev, [item.id]: e.target.value }))}
                      autoFocus
                    />
                  )}
                </div>
              </div>
            );
          })}
          
          {visibleItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">No se encontraron productos.</div>
          )}
        </div>

        <DialogFooter className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            Guardar {Object.keys(changes).length > 0 ? `(${Object.keys(changes).length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
