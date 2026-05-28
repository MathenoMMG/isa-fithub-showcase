import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Minus, Plus, ShoppingCart, Trash2, Edit2, Check, X, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { ProductoConLotes } from "@/types/inventory";
import { useInventory } from "@/context/InventoryContext";
import { ExpiryBadge } from "./ExpiryBadge";
import { AddLoteDialog } from "./AddLoteDialog";
import { formatExpiryDate, getEarliestExpiry, getExpiryStatus, getTotalQty, getWorstStatus } from "@/lib/expiry";
import { useProfile } from "@/context/ProfileContext";

interface Props {
  product: ProductoConLotes;
  defaultOpen?: boolean;
}

const rowStyles: Record<ReturnType<typeof getWorstStatus>, { bg: string; dot: string; text: string; border: string }> = {
  vencido: { bg: "bg-[#FCEBEB] dark:bg-red-900/10", dot: "bg-[#E24B4A]", text: "text-[#A32D2D] dark:text-red-400", border: "border-[#E24B4A]/30" },
  proximo: { bg: "bg-[#FAEEDA] dark:bg-amber-900/10", dot: "bg-[#EF9F27]", text: "text-[#854F0B] dark:text-amber-400", border: "border-[#EF9F27]/30" },
  en_regla: { bg: "bg-white dark:bg-slate-900", dot: "bg-[#97C459]", text: "text-[#3B6D11] dark:text-emerald-400", border: "border-[#97C459]/30" },
};

export function ProductRow({ product, defaultOpen = false }: Props) {
  const { sellFromLote, adjustLote, removeLote, removeProduct, updateProduct, restoreProduct } = useInventory();
  const [open, setOpen] = useState(defaultOpen);
  const { profile } = useProfile();
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesTemp, setNotesTemp] = useState(product.notas || "");

  const total = getTotalQty(product.lotes);
  const worst = getWorstStatus(product.lotes);
  const earliest = getEarliestExpiry(product.lotes);
  const sortedLotes = [...product.lotes].sort(
    (a, b) => new Date(a.fecha_caducidad).getTime() - new Date(b.fecha_caducidad).getTime(),
  );

  const styles = rowStyles[worst];
  const isPremium = profile.stylePreset === "obsidian";

  const handleSaveNotes = async () => {
    try {
      await updateProduct(product.id, { notas: notesTemp });
      toast.success("Notas actualizadas");
      setIsEditingNotes(false);
    } catch (e) {
      toast.error("Error al guardar las notas");
    }
  };

  return (
    <div className={
      isPremium
        ? `group rounded-[6px] border border-border dark:border-emerald-500/10 shadow-none overflow-hidden transition-all duration-200 hover:border-primary/30 dark:hover:border-emerald-500/30 ${styles.bg}`
        : `group rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${styles.bg}`
    }>
      {/* Header */}
      <div 
        className="flex items-center gap-[10px] p-[10px_14px] cursor-pointer hover:bg-slate-500/5 dark:hover:bg-emerald-500/5 transition-all"
        onClick={() => setOpen((o) => !o)}
      >
        <div className={`w-[8px] h-[8px] rounded-full shrink-0 ${styles.dot} ${isPremium ? "rounded-none w-1.5 h-1.5 animate-pulse" : ""}`} />
        
        <div className="flex-1 min-w-0 flex items-center gap-[8px] flex-wrap">
          <span className={`${isPremium ? "font-mono text-[11px] font-bold uppercase tracking-wide" : "font-sans text-[13px] font-medium text-[#111827] dark:text-slate-100"} truncate`}>{product.nombre}</span>
          <span className={isPremium ? "font-mono text-[9px] text-muted-foreground uppercase" : "font-sans text-[9px] text-[#9CA3AF]"}>
            {product.categoria || "Otros"} // {product.tienda_nombre}
          </span>
          <span className={isPremium ? "font-mono text-[9px] text-muted-foreground/60" : "font-mono-data text-[10px] text-[#6B7280]"}>
            SKU: {product.articulo}
          </span>
        </div>

        <div className="text-right shrink-0">
          <div className={`${isPremium ? "font-mono text-[20px]" : "font-mono-data text-[18px]"} font-semibold text-[#111827] dark:text-slate-100`}>{total}</div>
          <div className={isPremium ? "font-mono text-[8px] text-muted-foreground uppercase tracking-wider" : "font-sans text-[9px] text-[#9CA3AF] uppercase tracking-[0.05em]"}>unidades</div>
        </div>

        <div className="shrink-0 text-slate-400 ml-[4px]">
          <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"}`} />
        </div>
      </div>

      {/* Lotes */}
      <div 
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-3 sm:p-4 space-y-2">
            
            {/* Sección de Notas */}
            <div className={
              isPremium 
                ? "bg-slate-500/5 dark:bg-slate-950/20 rounded-[4px] border border-border dark:border-emerald-500/10 p-3 mb-4 font-mono text-[11px]"
                : "bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-4"
            }>
              <div className="flex items-center justify-between mb-1">
                <span className={isPremium ? "text-[9px] font-bold text-muted-foreground uppercase tracking-wider" : "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"}>Notas del Producto</span>
                {!isEditingNotes ? (
                  <button 
                    onClick={() => { setNotesTemp(product.notes || ""); setIsEditingNotes(true); }}
                    className={`${isPremium ? "text-[9px] uppercase tracking-wider font-bold" : "text-[10px] font-medium"} text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 p-1 flex items-center gap-1`}
                  >
                    <Edit2 size={10} /> <span>{isPremium ? "EDITAR" : "Editar"}</span>
                  </button>
                ) : (
                  <span className={`text-[10px] ${notesTemp.length > 150 ? 'text-red-500' : 'text-slate-400'}`}>
                    {notesTemp.length}/150
                  </span>
                )}
              </div>
              
              {!isEditingNotes ? (
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                  {product.notas ? product.notas : <span className="text-slate-400 dark:text-slate-500">Sin notas. Haz clic en editar para agregar información...</span>}
                </p>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    value={notesTemp} 
                    onChange={(e) => {
                      if (e.target.value.length <= 150) setNotesTemp(e.target.value);
                    }}
                    className="h-8 text-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
                    placeholder="Escribe hasta 150 caracteres..."
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNotes(); }}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 dark:text-emerald-400" onClick={handleSaveNotes}>
                    <Check size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 dark:text-slate-500" onClick={() => setIsEditingNotes(false)}>
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
          {sortedLotes.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400 italic px-2 py-3">Sin lotes en stock.</div>
          )}

          {sortedLotes.map((lote, idx) => {
            const status = getExpiryStatus(lote.fecha_caducidad);
            return (
              <div
                key={lote.id}
                className={
                  isPremium
                    ? "bg-card/60 dark:bg-slate-950/40 rounded-[4px] border border-border dark:border-emerald-500/10 p-3 flex flex-col md:flex-row md:items-center gap-3"
                    : "bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col md:flex-row md:items-center gap-3"
                }
              >
                {/* índice + caducidad */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={
                    isPremium
                      ? "h-8 w-8 rounded-[3px] border border-border dark:border-emerald-500/10 bg-slate-500/5 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0"
                      : "h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 tabular-nums"
                  }>
                    {isPremium ? `[0${idx + 1}]` : `#${idx + 1}`}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono-data font-medium text-slate-800">
                      {formatExpiryDate(lote.fecha_caducidad)}
                    </div>
                    <div className="mt-1">
                      <ExpiryBadge fecha={lote.fecha_caducidad} />
                    </div>
                  </div>
                </div>

                {/* cantidad + ajuste */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-full border-slate-300"
                    onClick={() => adjustLote(product.id, lote.id, -1)}
                    aria-label="Disminuir (ajuste)"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="min-w-[3rem] text-center text-xl font-bold tabular-nums">
                    {lote.cantidad}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-full border-slate-300"
                    onClick={() => adjustLote(product.id, lote.id, 1)}
                    aria-label="Aumentar (ajuste)"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                {/* acciones principales: VENTA + eliminar lote */}
                <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                  <div className="flex flex-col gap-1 mr-2 items-center">
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={async () => {
                          try {
                            const success = await undoSale(product.id, lote.id);
                            if (success) {
                              toast.success("Venta deshecha");
                            } else {
                              toast.info("No hay ventas para deshacer en este lote");
                            }
                          } catch (e) {
                            toast.error("No se pudo deshacer la venta");
                          }
                        }}
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 rounded-xl border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        title="Deshacer última venta"
                      >
                        <Undo2 className="h-5 w-5" />
                      </Button>
                      <Button
                        disabled={status === "vencido" || lote.cantidad <= 0}
                        onClick={() => {
                          if (lote.cantidad <= 0) {
                            toast.error("Lote sin stock");
                            return;
                          }
                          sellFromLote(product.id, lote.id, 1);
                          toast.success(`Venta registrada · ${product.nombre} (lote #${idx + 1})`);
                        }}
                        className={`h-11 px-4 gap-2 font-semibold rounded-xl text-white ${
                          status === "vencido" ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Venta
                      </Button>
                    </div>
                    {product.vendidos_total > 0 && (
                      <span className="text-[10px] text-center font-medium text-emerald-600">
                        {product.vendidos_total} vendidos
                      </span>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        aria-label="Eliminar lote"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar lote #{idx + 1}</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminarán las {lote.cantidad} unidades con caducidad{" "}
                          {formatExpiryDate(lote.fecha_caducidad)}. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => {
                            removeLote(product.id, lote.id);
                            toast.success("Lote eliminado");
                          }}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}

          {/* Footer acciones del producto */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <AddLoteDialog productId={product.id} productName={product.nombre} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar producto
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar producto completo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminará "{product.nombre}" junto con sus {product.lotes.length} lote(s) y {total} unidades.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      removeProduct(product.id);
                      toast.success(`Producto "${product.nombre}" eliminado`, {
                        action: {
                          label: "Deshacer",
                          onClick: () => {
                            toast.promise(restoreProduct(product.id), {
                              loading: "Restaurando...",
                              success: "Producto restaurado",
                              error: "Error al restaurar",
                            });
                          }
                        },
                        duration: 10000
                      });
                    }}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
