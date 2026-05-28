import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/context/InventoryContext";
import { useProfile } from "@/context/ProfileContext";
import { History, RotateCcw, Trash2, Box, MapPin, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function TrashBinDialog() {
  const { trashBin, restoreProduct, clearTrashBin } = useInventory();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);

  const isObsidian = profile?.stylePreset === "obsidian";

  const handleRestore = async (productId: string) => {
    setIsRestoringId(productId);
    try {
      await restoreProduct(productId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRestoringId(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("¿Estás seguro de que deseas vaciar por completo la papelera de reciclaje? Esta acción no se puede deshacer.")) {
      clearTrashBin();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`relative h-12 w-full sm:w-auto gap-2 border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 transition-all ${
            isObsidian 
              ? "rounded-md border-slate-300 dark:border-slate-800 font-mono text-sm tracking-tight hover:bg-slate-100/50 dark:hover:bg-slate-800/40" 
              : "rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <History className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
          <span>Historial / Papelera</span>
          {trashBin.length > 0 && (
            <span className={`h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse ${
              isObsidian ? "font-mono" : ""
            }`}>
              {trashBin.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`max-w-2xl bg-white dark:bg-slate-950 border transition-all ${
        isObsidian 
          ? "rounded-md border-slate-300 dark:border-slate-800" 
          : "rounded-2xl border-slate-200 dark:border-slate-800"
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-50 ${
            isObsidian ? "font-mono tracking-tight uppercase" : ""
          }`}>
            <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Papelera de Reciclaje</span>
          </DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aquí se conservan los productos eliminados recientemente. Puedes restablecerlos con su estado original (incluyendo lotes y claves) en cualquier momento.
          </p>
        </DialogHeader>

        <div className="my-4 max-h-[400px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {trashBin.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full mb-3">
                <Box className="h-8 w-8 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className={`text-base font-semibold text-slate-700 dark:text-slate-300 ${
                isObsidian ? "font-mono" : ""
              }`}>Papelera vacía</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
                No hay productos eliminados recientemente. Cuando elimines un producto completo, aparecerá aquí.
              </p>
            </div>
          ) : (
            trashBin.map((entry) => {
              const { product, deletedAt } = entry;
              const formattedDate = format(parseISO(deletedAt), "d 'de' MMMM, h:mm a", { locale: es });
              const totalUnits = product.lotes?.reduce((acc, l) => acc + l.cantidad, 0) || 0;

              return (
                <div
                  key={product.id}
                  className={`p-4 border bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60 ${
                    isObsidian 
                      ? "rounded-md border-slate-300 dark:border-slate-800 font-mono text-xs" 
                      : "rounded-xl border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {product.nombre}
                      </h4>
                      <span className={`px-2 py-0.5 text-[10px] font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded ${
                        isObsidian ? "border border-slate-300 dark:border-slate-700" : ""
                      }`}>
                        {product.categoria || "Sin categoría"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.tienda_nombre}
                      </span>
                      <span className="flex items-center gap-1">
                        <Box className="h-3 w-3" />
                        {product.lotes?.length || 0} lotes ({totalUnits} ud)
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                        <Clock className="h-3 w-3" />
                        Eliminado: {formattedDate}
                      </span>
                    </div>

                    {product.articulo && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 flex gap-2">
                        <span>SKU/Art: <span className="font-semibold">{product.articulo}</span></span>
                        {product.sicol && <span>SICOL: <span className="font-semibold">{product.sicol}</span></span>}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(product.id)}
                    disabled={isRestoringId !== null}
                    className={`h-9 shrink-0 gap-1.5 border border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-300 bg-white hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ${
                      isObsidian ? "rounded-md font-mono" : "rounded-lg"
                    }`}
                  >
                    {isRestoringId === product.id ? (
                      <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Restablecer
                  </Button>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t border-slate-100 dark:border-slate-900 pt-4">
          {trashBin.length > 0 && (
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className={`text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 mr-auto ${
                isObsidian ? "rounded-md font-mono text-xs uppercase" : "rounded-xl"
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vaciar Papelera
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className={`${isObsidian ? "rounded-md font-mono text-xs uppercase" : "rounded-xl"}`}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
