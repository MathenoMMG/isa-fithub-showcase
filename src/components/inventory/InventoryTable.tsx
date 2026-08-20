import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Minus, Plus, ShoppingCart, Trash2, Edit2, Check, X, Undo2, History, PackageOpen, AlertTriangle, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useProfile } from "@/context/ProfileContext";
import { ExpiryBadge } from "./ExpiryBadge";
import { AddLoteDialog } from "./AddLoteDialog";
import { MermaDialog } from "./MermaDialog";
import { formatExpiryDate, getEarliestExpiry, getExpiryStatus, getTotalQty, getWorstStatus } from "@/lib/expiry";
import { ProductRow } from "./ProductRow";

interface Props {
  data: ProductoConLotes[];
  collapseCounter: number;
  expandCounter: number;
}

export function InventoryTable({ data, collapseCounter, expandCounter }: Props) {
  const { profile } = useProfile();
  const isPremium = profile.stylePreset === "obsidian";

  // State to track selected product in premium split-screen POS layout
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Mobile sheet detail drawer state
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Group items by category
  const grouped = useMemo(() => {
    const map = new Map<string, ProductoConLotes[]>();
    for (const item of data) {
      const cat = item.categoria || "Otros";
      const arr = map.get(cat) ?? [];
      arr.push(item);
      map.set(cat, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  // Fallback to first filtered product if currently selected is filtered out
  const selectedProduct = useMemo(() => {
    if (data.length === 0) return null;
    const found = data.find(p => p.id === selectedProductId);
    return found || data[0];
  }, [data, selectedProductId]);

  // Sync selected ID when fallback occurs
  useEffect(() => {
    if (selectedProduct && selectedProduct.id !== selectedProductId) {
      setSelectedProductId(selectedProduct.id);
    }
  }, [selectedProduct, selectedProductId]);

  if (data.length === 0) {
    return (
      <div className={
        isPremium
          ? "rounded-[3px] border border-border dark:border-primary/5 bg-card/30 dark:bg-slate-900/30 p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-wider"
          : "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-400 transition-colors"
      }>
        No hay productos que coincidan con la búsqueda.
      </div>
    );
  }

  // --- PREMIUM VIEW (OBSIDIAN V3 SPLIT-PANEL POS DECK) ---
  if (isPremium) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Product List by Category (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto scrollbar-thin pr-1">
          {grouped.map(([linea, items]) => (
            <div key={linea} className="border border-border dark:border-primary/5 rounded-[3px] bg-card/10 dark:bg-slate-900/10 overflow-hidden shadow-none">
              <div className="flex justify-between items-center p-[10px_14px] bg-slate-50/50 dark:bg-slate-950/20 border-b border-border dark:border-primary/5">
                <span className="font-mono text-[10px] font-bold text-slate-800 dark:text-emerald-400 uppercase tracking-widest">
                  {linea}
                </span>
                <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-[2px] bg-muted/40 dark:bg-primary/5 text-slate-600 dark:text-emerald-400 border border-border dark:border-primary/5">
                  {items.length}
                </span>
              </div>
              <div className="divide-y divide-dashed divide-border/60 dark:divide-primary/5">
                {items.map((p) => {
                  const isSelected = p.id === selectedProductId;
                  const totalStock = getTotalQty(p.lotes);
                  const worstStatus = getWorstStatus(p.lotes);
                  const statusDotColor = worstStatus === "vencido" ? "bg-red-500" : worstStatus === "proximo" ? "bg-amber-500" : "bg-emerald-500";
                  
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setIsMobileDetailOpen(true);
                      }}
                      className={`flex items-center gap-3 p-[12px_14px] cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? "bg-muted/40 dark:bg-primary/10 border-l-[3px] border-l-primary dark:border-l-emerald-400 font-bold" 
                          : "hover:bg-muted/20 dark:hover:bg-primary/3"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-none shrink-0 ${statusDotColor} ${worstStatus === "vencido" ? "animate-pulse" : ""}`} />
                      <div className="flex-1 min-w-0">
                        <p className="premium-product-name-list text-[13px] text-slate-900 dark:text-slate-100 truncate">
                          {p.nombre}
                        </p>
                        <p className="font-sans text-[10px] font-bold text-muted-foreground/60 mt-0.5 uppercase tracking-wide">
                          SKU: {p.articulo}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-sans text-[14px] font-black text-slate-900 dark:text-slate-100 leading-none">
                          {totalStock}
                        </p>
                        <p className="font-sans text-[10px] font-bold text-slate-500 dark:text-muted-foreground/60 uppercase tracking-wider mt-1">
                          STOCK
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side (Desktop): Detail Control Console (lg:col-span-7) */}
        <div className="hidden lg:block lg:col-span-7 bg-card/30 dark:bg-slate-900/30 border border-border dark:border-primary/5 rounded-[3px] p-6 min-h-[550px] overflow-y-auto max-h-[750px] scrollbar-thin dark:backdrop-blur-[12px] dark:backdrop-saturate-[140%] dark:shadow-[inset_0_0.5px_0_oklch(0.82_0.16_160/4%)]">
          {selectedProduct ? (
            <ProductDetailConsole product={selectedProduct} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[450px] text-center border border-dashed border-border/80 dark:border-primary/5 p-6 rounded-[2px]">
              <PackageOpen className="w-12 h-12 text-muted-foreground/30 animate-pulse mb-3" />
              <p className="font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                [ FITHUB TELEMETRY SYSTEM ]
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/60 uppercase mt-1">
                SELECT A PRODUCT FROM THE CATALOGUE TO ACCESS CONTROL PANEL
              </p>
            </div>
          )}
        </div>

        {/* Mobile Detail Overlay Sheet (Drawer) */}
        {isMobileDetailOpen && selectedProduct && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
            <div className="bg-background w-full max-h-[90vh] rounded-t-[12px] border-t border-border dark:border-slate-800 p-5 overflow-y-auto flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center border-b border-border dark:border-slate-800 pb-3">
                <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  [ DETALLE DE PRODUCTO ]
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                  onClick={() => setIsMobileDetailOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ProductDetailConsole product={selectedProduct} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- CLASSIC VIEW (STANDARD ACCORDION) ---
  return (
    <div className="space-y-4">
      {grouped.map(([linea, items]) => (
        <LineaGroup 
          key={linea} 
          linea={linea} 
          items={items} 
          collapseCounter={collapseCounter} 
          expandCounter={expandCounter} 
        />
      ))}
    </div>
  );
}

// ==========================================================================
// COMPONENT: ProductDetailConsole (Premium Luxury Dashboard detail view)
// ==========================================================================
function ProductDetailConsole({ product }: { product: ProductoConLotes }) {
  const { sellFromLote, adjustLote, removeLote, removeProduct, updateProduct, restoreProduct, undoSale } = useInventory();
  const { profile } = useProfile();
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesTemp, setNotesTemp] = useState(product.notas || "");
  const [showPreviousLotes, setShowPreviousLotes] = useState(false);
  const [mermaDialogOpen, setMermaDialogOpen] = useState(false);
  const [selectedLoteForMerma, setSelectedLoteForMerma] = useState<Lote | undefined>(undefined);

  // Sync temp notes when product changes
  useEffect(() => {
    setNotesTemp(product.notas || "");
    setIsEditingNotes(false);
  }, [product]);

  const handleSaveNotes = async () => {
    try {
      await updateProduct(product.id, { notas: notesTemp });
      toast.success("Notas actualizadas");
      setIsEditingNotes(false);
    } catch (e) {
      toast.error("Error al guardar las notas");
    }
  };

  const totalQty = getTotalQty(product.lotes);
  const worstStatus = getWorstStatus(product.lotes);
  const earliestExpiry = getEarliestExpiry(product.lotes);
  const sortedLotes = [...product.lotes].sort(
    (a, b) => new Date(a.fecha_caducidad).getTime() - new Date(b.fecha_caducidad).getTime()
  );

  const activeLotes = sortedLotes.filter((l) => l.cantidad > 0);
  const previousLotes = sortedLotes.filter((l) => l.cantidad === 0);

  return (
    <div className="space-y-6 text-left">
      {/* Upper header */}
      <div className="flex flex-col gap-1.5 border-b border-border dark:border-primary/5 pb-4">
        <div className="flex items-center gap-2 text-xs font-sans font-extrabold text-slate-500 uppercase tracking-wider">
          <span>{product.categoria || "OTROS"}</span>
          <span>//</span>
          <span>{product.tienda_nombre}</span>
        </div>
        <div className="premium-product-title text-2xl sm:text-3xl text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {product.nombre}
        </div>
        <div className="flex items-center gap-4 text-xs font-sans font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">
          <span>SKU: {product.articulo}</span>
          <span>•</span>
          <span>ID: {product.id.substring(0, 8)}</span>
        </div>
      </div>

      {/* MASSIVE METRICS GRID - HIGH READABILITY (Resolves user's sizing critique!) */}
      <div className="grid grid-cols-2 gap-4 border border-border dark:border-primary/5 rounded-[3px] bg-slate-50/40 dark:bg-slate-900/10 p-6 text-center">
        <div className="flex flex-col items-center justify-center p-3 border-r border-border dark:border-primary/5">
          <span className="font-sans text-5xl md:text-6xl font-black text-slate-900 dark:text-emerald-400 tracking-tight leading-none">
            {totalQty}
          </span>
          <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-3">
            UNIDADES EN STOCK
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-3">
          <span className="font-sans text-5xl md:text-6xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
            {product.vendidos_total || 0}
          </span>
          <span className="font-sans text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mt-3">
            UNIDADES VENDIDAS
          </span>
        </div>
      </div>

      {/* Expiry telemetric alert banner */}
      {earliestExpiry ? (
        <div className={`p-4 border font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-between rounded-[2px] ${
          worstStatus === "vencido" 
            ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" 
            : worstStatus === "proximo" 
            ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" 
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-none ${worstStatus === "vencido" ? "bg-red-500 animate-ping" : worstStatus === "proximo" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            <span>
              {worstStatus === "vencido" 
                ? "ALERT: LOTE EXPIRED — DISPOSE TODAY" 
                : worstStatus === "proximo" 
                ? "WARNING: ROTATE PRODUCT (≤ 30 DAYS)" 
                : "STATUS: NOMINAL // ALL BATCHES CLEAR"}
            </span>
          </div>
          <span className="text-[11px] opacity-75 font-sans font-bold">
            {formatExpiryDate(earliestExpiry)}
          </span>
        </div>
      ) : null}

      {/* Notes section */}
      <div className="bg-muted/40 dark:bg-slate-950/30 rounded-[2px] border border-border dark:border-primary/5 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs font-bold text-slate-500 uppercase tracking-wider">
            Notas del Producto
          </span>
          {!isEditingNotes ? (
            <button 
              onClick={() => setIsEditingNotes(true)}
              className="font-sans text-xs font-extrabold text-primary dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 hover:underline transition-all"
            >
              <Edit2 size={10} /> EDITAR
            </button>
          ) : (
            <span className={`font-mono text-[10px] ${notesTemp.length > 150 ? 'text-red-500' : 'text-slate-400'}`}>
              {notesTemp.length}/150
            </span>
          )}
        </div>
        
        {!isEditingNotes ? (
          <p className="font-mono text-[12px] text-slate-700 dark:text-slate-350 italic">
            {product.notas ? product.notas : "Sin notas. Haz clic en editar para agregar información relevante de góndola..."}
          </p>
        ) : (
          <div className="flex gap-2">
            <Input 
              value={notesTemp} 
              onChange={(e) => {
                if (e.target.value.length <= 150) setNotesTemp(e.target.value);
              }}
              className="h-9 font-mono text-[12px] dark:bg-slate-900 border-slate-300 dark:border-primary/5 rounded-[2px] dark:text-slate-200"
              placeholder="Escribe hasta 150 caracteres..."
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNotes(); }}
            />
            <Button size="icon" variant="ghost" className="h-9 w-9 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={handleSaveNotes}>
              <Check size={16} />
            </Button>
            <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsEditingNotes(false)}>
              <X size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Lotes Activos */}
      <div className="space-y-3">
        <h4 className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          [ ACTIVE BATCHES // LOTES ACTIVOS ]
        </h4>
        {activeLotes.length === 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground/60 italic p-6 border border-dashed border-border/80 dark:border-primary/5 text-center">
            NO ACTIVE BATCHES DETECTED IN CURRENT STOCK
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeLotes.map((lote, idx) => {
              const status = getExpiryStatus(lote.fecha_caducidad);
              
              return (
                <div key={lote.id} className="border border-border dark:border-primary/5 rounded-[2px] bg-slate-50/20 dark:bg-slate-900/10 p-4 space-y-4">
                  {/* Batch Info Header */}
                  <div className="flex justify-between items-center flex-wrap gap-2 border-b border-dashed border-border dark:border-primary/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-muted/40 dark:bg-primary/5 text-slate-600 dark:text-emerald-400 border border-border dark:border-primary/5">
                        BATCH #{idx + 1}
                      </span>
                      <span className="font-mono text-[12px] font-semibold text-slate-900 dark:text-slate-200">
                        {formatExpiryDate(lote.fecha_caducidad)}
                      </span>
                    </div>
                    <ExpiryBadge fecha={lote.fecha_caducidad} />
                  </div>

                  {/* Quantity adjusts and Actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Quantity Adjuster */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-slate-300 dark:border-primary/5 rounded-[2px] bg-muted/40 dark:bg-slate-800/40 hover:bg-muted/65 dark:hover:bg-slate-800 transition-all"
                        onClick={() => adjustLote(product.id, lote.id, -1)}
                        aria-label="Disminuir (ajuste)"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[3.5rem] text-center text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                        {lote.cantidad}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-slate-300 dark:border-primary/5 rounded-[2px] bg-muted/40 dark:bg-slate-800/40 hover:bg-muted/65 dark:hover:bg-slate-800 transition-all"
                        onClick={() => adjustLote(product.id, lote.id, 1)}
                        aria-label="Aumentar (ajuste)"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="font-mono text-[9px] text-muted-foreground/60 uppercase ml-1">UDS</span>
                    </div>

                    {/* Right: VENTA + UNDO + TRASH actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        onClick={async () => {
                          try {
                            const success = await undoSale(product.id, lote.id);
                            if (success) toast.success("Venta deshecha");
                            else toast.info("No hay ventas para deshacer en este lote");
                          } catch (e) {
                            toast.error("No se pudo deshacer la venta");
                          }
                        }}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-slate-300 dark:border-primary/5 text-slate-500 hover:bg-muted/40 dark:bg-slate-800/40 dark:hover:bg-slate-850 rounded-[2px]"
                        title="Deshacer última venta"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        disabled={lote.cantidad <= 0}
                        onClick={() => {
                          setSelectedLoteForMerma(lote);
                          setMermaDialogOpen(true);
                        }}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-[2px]"
                        title="Registrar merma / pérdida de este lote"
                      >
                        <AlertOctagon className="h-4 w-4" />
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
                        className={`h-10 px-4 gap-2 font-mono text-[10px] font-bold tracking-wider uppercase rounded-[2px] text-white border border-primary/10 transition-all ${
                          status === "vencido" ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        REGISTRAR VENTA
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-red-200 dark:border-red-950/20 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-[2px]"
                            aria-label="Eliminar lote"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar lote BATCH #{idx + 1}</AlertDialogTitle>
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
                  {lote.vendidos !== undefined && lote.vendidos > 0 && (
                    <div className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 uppercase">
                      <span className="w-1 h-1 bg-emerald-500 rounded-none inline-block" />
                      {lote.vendidos} unidades vendidas de este lote
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lotes Agotados / Historial */}
      {previousLotes.length > 0 && (
        <div className="pt-4 border-t border-border dark:border-primary/5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreviousLotes((prev) => !prev)}
            className="h-9 gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350 font-mono text-[10px] uppercase tracking-wider rounded-[2px]"
          >
            <History className={`h-3.5 w-3.5 transition-transform ${showPreviousLotes ? "rotate-180" : ""}`} />
            <span>{showPreviousLotes ? "Ocultar lotes anteriores" : `Ver lotes anteriores (${previousLotes.length})`}</span>
          </Button>
          
          {showPreviousLotes && (
            <div className="mt-3 space-y-2 pl-3 border-l border-border dark:border-primary/5 animate-in fade-in duration-200">
              {previousLotes.map((lote, idx) => (
                <div
                  key={lote.id}
                  className="bg-muted/40 dark:bg-slate-950/20 rounded-[2px] border border-dashed border-border p-3 flex flex-col md:flex-row md:items-center gap-3 opacity-60 hover:opacity-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 rounded-[2px] border border-border bg-muted/40 text-slate-500 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      [A{idx + 1}]
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-[12px] font-medium text-slate-600 dark:text-slate-400">
                        {formatExpiryDate(lote.fecha_caducidad)}
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wider">
                          Agotado
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 px-3 font-mono text-[11px]">
                    <span className="text-slate-400 dark:text-slate-500">
                      0 unidades
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ({lote.vendidos || 0} vendidos)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                    <Button
                      onClick={async () => {
                        try {
                          const success = await undoSale(product.id, lote.id);
                          if (success) toast.success("Venta deshecha, lote reactivado.");
                          else toast.warning("No hay ventas registradas para este lote");
                        } catch (e) {
                          toast.error("Error al deshacer la venta");
                        }
                      }}
                      className="h-7 px-2 font-mono text-[9px] uppercase tracking-wider rounded-[2px] border border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      variant="outline"
                    >
                      Deshacer venta
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-[2px] border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="Eliminar lote agotado"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Control panel footer: Add Lote + Registrar Merma + Delete Product */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border dark:border-primary/5">
        <AddLoteDialog productId={product.id} productName={product.nombre} />

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedLoteForMerma(undefined);
            setMermaDialogOpen(true);
          }}
          disabled={totalQty <= 0}
          className="h-10 gap-1.5 border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px]"
        >
          <AlertOctagon className="h-4 w-4" />
          REGISTRAR MERMA
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 gap-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 ml-auto font-mono text-[10px] font-bold uppercase tracking-wider rounded-[2px]"
            >
              <Trash2 className="h-4 w-4" />
              ELIMINAR PRODUCTO COMPLETO
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar producto completo</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará "{product.nombre}" junto con sus {product.lotes.length} lote(s) y {totalQty} unidades.
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

      <MermaDialog
        product={product}
        lote={selectedLoteForMerma}
        open={mermaDialogOpen}
        onOpenChange={setMermaDialogOpen}
      />
    </div>
  );
}

// ==========================================================================
// COMPONENT: LineaGroup (Classic View Accordion Grouping)
// ==========================================================================
function LineaGroup({ 
  linea, 
  items, 
  collapseCounter, 
  expandCounter 
}: { 
  linea: string; 
  items: ProductoConLotes[];
  collapseCounter: number;
  expandCounter: number;
}) {
  const [open, setOpen] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    if (collapseCounter > 0) setOpen(false);
  }, [collapseCounter]);

  useEffect(() => {
    if (expandCounter > 0) setOpen(true);
  }, [expandCounter]);

  const isPremium = profile.stylePreset === "obsidian";

  return (
    <section>
      <button
        onClick={() => setOpen((o) => !o)}
        className={
          isPremium
            ? "w-full flex items-center gap-[8px] bg-card/30 dark:bg-slate-900/30 border border-border dark:border-primary/5 border-l-[4px] border-l-primary dark:border-l-emerald-400 rounded-[2px] p-[10px_14px] text-left hover:bg-muted/40 dark:hover:bg-primary/5 transition-all outline-none"
            : "w-full flex items-center gap-[8px] bg-[#F9FAF8] dark:bg-slate-900/80 border-l-[3px] border-l-[#1C4A2E] dark:border-l-emerald-500 rounded-[10px] p-[10px_14px] text-left hover:brightness-95 transition-all outline-none"
        }
      >
        <span className={isPremium ? "font-mono text-[11px] font-bold text-slate-950 dark:text-emerald-400 leading-none uppercase tracking-wider" : "font-sans text-[14px] font-semibold text-[#1C4A2E] dark:text-emerald-400 leading-none"}>
          {linea}
        </span>
        <span className={
          isPremium
            ? "font-mono text-[9px] font-bold bg-muted/40 dark:bg-primary/5 text-primary dark:text-emerald-400 border border-border dark:border-primary/5 px-2 py-0.5 rounded-[2px] leading-none"
            : "font-sans text-[11px] font-medium bg-[#EAF3DE] dark:bg-emerald-900/40 text-[#3B6D11] dark:text-emerald-400 px-[8px] py-[2px] rounded-full leading-none"
        }>
          {items.length}
        </span>
        <div className={isPremium ? "ml-auto text-primary dark:text-emerald-400" : "ml-auto text-[#1C4A2E] dark:text-emerald-400"}>
          <ChevronRight size={16} className={`transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"}`} />
        </div>
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"}`}
      >
        <div className="overflow-hidden">
          <div className={`space-y-2 ml-3 pl-3 border-l ${isPremium ? "border-border dark:border-primary/5" : "border-slate-100 dark:border-slate-800"} py-1`}>
            {items.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
