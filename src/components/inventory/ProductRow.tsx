import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Minus, Plus, ShoppingCart, Trash2, Edit2, Check, X, Undo2, History, AlertOctagon, ArrowLeftRight } from "lucide-react";
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
import type { ProductoConLotes, Lote } from "@/types/inventory";
import { useInventory } from "@/context/InventoryContext";
import { ExpiryBadge } from "./ExpiryBadge";
import { AddLoteDialog } from "./AddLoteDialog";
import { MermaDialog } from "./MermaDialog";
import { TransferStockDialog } from "./TransferStockDialog";
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
  const { sellFromLote, adjustLote, removeLote, removeProduct, updateProduct, restoreProduct, undoSale } = useInventory();
  const [open, setOpen] = useState(defaultOpen);
  const [showPreviousLotes, setShowPreviousLotes] = useState(false);
  const [mermaDialogOpen, setMermaDialogOpen] = useState(false);
  const [selectedLoteForMerma, setSelectedLoteForMerma] = useState<Lote | undefined>(undefined);
  const { profile } = useProfile();
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesTemp, setNotesTemp] = useState(product.notas || "");

  const total = getTotalQty(product.lotes);
  const worst = getWorstStatus(product.lotes);
  const earliest = getEarliestExpiry(product.lotes);
  const sortedLotes = [...product.lotes].sort(
    (a, b) => {
      const timeA = a.fecha_caducidad ? new Date(a.fecha_caducidad).getTime() : Infinity;
      const timeB = b.fecha_caducidad ? new Date(b.fecha_caducidad).getTime() : Infinity;
      return timeA - timeB;
    },
  );

  const activeLotes = sortedLotes.filter((l) => l.cantidad > 0);
  const previousLotes = sortedLotes.filter((l) => l.cantidad === 0);

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
        ? `group rounded-[3px] border border-border dark:border-primary/5 shadow-none overflow-hidden transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/20 ${styles.bg}`
        : `group rounded-[10px] border-[0.5px] border-[#E5E7EB] dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${styles.bg}`
    }>
      {/* Header */}
      <div 
        className="flex items-center gap-[10px] p-[10px_14px] cursor-pointer hover:bg-slate-500/5 dark:hover:bg-emerald-500/5 transition-all"
        onClick={() => setOpen((o) => !o)}
      >
        <div className={`w-[8px] h-[8px] rounded-full shrink-0 ${styles.dot} ${isPremium ? "rounded-none w-1 h-1 animate-pulse" : ""}`} />
        
        <div className="flex-1 min-w-0 flex items-center gap-[8px] flex-wrap">
          <span className={`${isPremium ? "font-mono text-[11px] font-bold uppercase tracking-wide" : "font-sans text-[13px] font-medium text-[#111827] dark:text-slate-100"} truncate`}>{product.nombre}</span>
          <span className={isPremium ? "font-mono text-[9px] text-muted-foreground uppercase" : "font-sans text-[9px] text-[#9CA3AF]"}>
            {product.categoria || "Otros"} // {product.tienda_nombre}
          </span>
          <span className={isPremium ? "font-mono text-[9px] text-muted-foreground/60" : "font-mono-data text-[10px] text-[#6B7280]"}>
            SKU: {product.articulo}
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-4 shrink-0 text-center">
          <div className="flex flex-col items-center min-w-[50px]">
            <span className={`${isPremium ? "font-mono text-[20px]" : "font-mono-data text-[18px]"} font-semibold text-[#111827] dark:text-slate-100 leading-none`}>
              {total}
            </span>
            <span className={`mt-1 ${isPremium ? "font-mono text-[8px] text-muted-foreground uppercase tracking-wider" : "font-sans text-[9px] text-[#9CA3AF] uppercase tracking-[0.05em] font-medium"}`}>
              en stock
            </span>
          </div>
          <div className="h-6 border-l border-slate-200 dark:border-slate-800 shrink-0" />
          <div className="flex flex-col items-center min-w-[50px]">
            <span className={`${isPremium ? "font-mono text-[20px]" : "font-mono-data text-[18px]"} font-semibold text-emerald-600 dark:text-emerald-400 leading-none`}>
              {product.vendidos_total || 0}
            </span>
            <span className={`mt-1 ${isPremium ? "font-mono text-[8px] text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider" : "font-sans text-[9px] text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.05em] font-medium"}`}>
              vendido
            </span>
          </div>
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
                ? "bg-muted/40 dark:bg-slate-950/30 rounded-[2px] border border-border dark:border-primary/5 p-3 mb-4 font-mono text-[11px]"
                : "bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-4"
            }>
              <div className="flex items-center justify-between mb-1">
                <span className={isPremium ? "text-[9px] font-bold text-muted-foreground uppercase tracking-wider" : "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"}>Notas del Producto</span>
                {!isEditingNotes ? (
                  <button 
                    onClick={() => { setNotesTemp(product.notas || ""); setIsEditingNotes(true); }}
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
          {activeLotes.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400 italic px-2 py-3">Sin lotes activos en stock.</div>
          )}

          {activeLotes.map((lote, idx) => {
            const status = getExpiryStatus(lote.fecha_caducidad);
            return (
              <div
                key={lote.id}
                className={
                  isPremium
                    ? "bg-card/30 dark:bg-slate-950/20 rounded-[2px] border border-border dark:border-primary/5 p-3 flex flex-col md:flex-row md:items-center gap-3"
                    : "bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col md:flex-row md:items-center gap-3"
                }
              >
                {/* índice + caducidad */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={
                    isPremium
                      ? "h-8 w-8 rounded-[2px] border border-border dark:border-primary/5 bg-muted/40 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0"
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
                    className={`h-11 w-11 border-slate-300 ${isPremium ? "rounded-[2px] border-border dark:border-primary/5 dark:bg-slate-800/20" : "rounded-full"}`}
                    onClick={() => adjustLote(product.id, lote.id, -1)}
                    aria-label="Disminuir (ajuste)"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className={`min-w-[3rem] text-center text-xl font-bold tabular-nums ${isPremium ? "font-mono text-lg" : ""}`}>
                    {lote.cantidad}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-11 w-11 border-slate-300 ${isPremium ? "rounded-[2px] border-border dark:border-primary/5 dark:bg-slate-800/20" : "rounded-full"}`}
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
                        className={`h-11 w-11 border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-slate-100 ${
                          isPremium ? "rounded-[2px] border-border dark:border-primary/5 dark:bg-slate-800/40 dark:hover:bg-slate-800/80" : "rounded-xl"
                        }`}
                        title="Deshacer última venta"
                      >
                        <Undo2 className="h-5 w-5" />
                      </Button>

                      <TransferStockDialog
                        initialProductId={product.id}
                        initialLoteId={lote.id}
                        customTrigger={
                          <Button
                            disabled={lote.cantidad <= 0}
                            variant="outline"
                            size="icon"
                            className={`h-11 w-11 border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 ${
                              isPremium ? "rounded-[2px]" : "rounded-xl"
                            }`}
                            title="Trasladar stock de este lote a otra tienda"
                          >
                            <ArrowLeftRight className="h-5 w-5" />
                          </Button>
                        }
                      />

                      <Button
                        disabled={lote.cantidad <= 0}
                        onClick={() => {
                          setSelectedLoteForMerma(lote);
                          setMermaDialogOpen(true);
                        }}
                        variant="outline"
                        size="icon"
                        className={`h-11 w-11 border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 ${
                          isPremium ? "rounded-[2px]" : "rounded-xl"
                        }`}
                        title="Registrar merma / pérdida de este lote"
                      >
                        <AlertOctagon className="h-5 w-5" />
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
                        className={`h-11 px-4 gap-2 font-semibold text-white ${
                          isPremium ? "rounded-[2px] font-mono text-[11px] tracking-wider uppercase border border-primary/10" : "rounded-xl"
                        } ${
                          status === "vencido" ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Venta
                      </Button>
                    </div>
                    {lote.vendidos !== undefined && lote.vendidos > 0 && (
                      <span className="text-[10px] text-center font-bold text-emerald-600 dark:text-emerald-400 w-full block mt-1">
                        {lote.vendidos} vendidos
                      </span>
                    )}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-11 w-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 ${
                          isPremium ? "rounded-[2px] dark:border-red-950/20" : "rounded-xl"
                        }`}
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

          {previousLotes.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreviousLotes((prev) => !prev)}
                className="h-9 gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-[4px]"
              >
                <History className={`h-3.5 w-3.5 transition-transform ${showPreviousLotes ? "rotate-180" : ""}`} />
                <span>{showPreviousLotes ? "Ocultar lotes anteriores" : `Ver lotes anteriores (${previousLotes.length})`}</span>
              </Button>
              
              {showPreviousLotes && (
                <div className="mt-2 space-y-2 pl-2 border-l border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
                  {previousLotes.map((lote, idx) => {
                    return (
                      <div
                        key={lote.id}
                        className={
                          isPremium
                            ? "bg-muted/40 dark:bg-slate-950/20 rounded-[2px] border border-dashed border-border p-3 flex flex-col md:flex-row md:items-center gap-3 opacity-60 hover:opacity-100 transition-all duration-300"
                            : "bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 p-3 flex flex-col md:flex-row md:items-center gap-3 opacity-70 hover:opacity-100 transition-opacity"
                        }
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={
                            isPremium
                              ? "h-8 w-8 rounded-[2px] border border-border bg-muted/40 text-slate-505 font-mono text-xs font-bold flex items-center justify-center shrink-0"
                              : "h-10 w-10 rounded-lg bg-slate-100 text-slate-505 font-bold flex items-center justify-center shrink-0"
                          }>
                            {isPremium ? `[A${idx + 1}]` : `A${idx + 1}`}
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono-data font-medium text-slate-600 dark:text-slate-400 text-sm">
                              {formatExpiryDate(lote.fecha_caducidad)}
                            </div>
                            <div className="mt-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                Agotado
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 px-3">
                          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                            0 unidades
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono-data">
                            ({lote.vendidos || 0} vendidos)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                          <Button
                            onClick={async () => {
                              try {
                                const success = await undoSale(product.id, lote.id);
                                if (success) {
                                  toast.success("Venta deshecha, lote reactivado.");
                                } else {
                                  toast.warning("No hay ventas registradas para este lote");
                                }
                              } catch (e) {
                                toast.error("Error al deshacer la venta");
                              }
                            }}
                            className={
                              isPremium
                                ? "h-7 px-2 font-mono text-[9px] uppercase tracking-wider rounded-[2px] border border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                : "h-8 px-2.5 text-xs rounded-lg border border-emerald-100 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/10"
                            }
                            variant="outline"
                          >
                            Deshacer venta
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-lg border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Eliminar lote agotado"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar lote agotado</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará permanentemente este lote agotado con caducidad{" "}
                                  {formatExpiryDate(lote.fecha_caducidad)} del historial. Esta acción no se puede deshacer.
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
                </div>
              )}
            </div>
          )}

          {/* Footer acciones del producto */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <AddLoteDialog productId={product.id} productName={product.nombre} />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLoteForMerma(undefined);
                setMermaDialogOpen(true);
              }}
              disabled={total <= 0}
              className={`h-10 gap-1.5 border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 ${
                isPremium ? "font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px]" : "rounded-xl"
              }`}
            >
              <AlertOctagon className="h-4 w-4" />
              {isPremium ? "REGISTRAR MERMA" : "Registrar merma"}
            </Button>

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

      <MermaDialog
        product={product}
        lote={selectedLoteForMerma}
        open={mermaDialogOpen}
        onOpenChange={setMermaDialogOpen}
      />
    </div>
  );
}
