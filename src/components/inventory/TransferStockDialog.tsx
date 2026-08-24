import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, ArrowRight, Truck, Check, Undo2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";
import { useProfile } from "@/context/ProfileContext";
import type { StoreId } from "@/types/inventory";
import { formatExpiryDate } from "@/lib/expiry";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STORES: { id: number; name: StoreId }[] = [
  { id: 1, name: "Norte" },
  { id: 2, name: "Sur" },
  { id: 3, name: "Centro" },
];

interface Props {
  initialProductId?: string;
  initialLoteId?: string;
  customTrigger?: React.ReactNode;
}

export function TransferStockDialog({ initialProductId, initialLoteId, customTrigger }: Props) {
  const { items, transferStock, traspasos, undoTraspaso } = useInventory();
  const { store } = useStore();
  const { profile } = useProfile();
  const isPremium = profile.stylePreset === "obsidian";

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"transfer" | "history">("transfer");

  // Defaults based on current store
  const defaultOriginStore: StoreId = store === "Ambas" || store === "Todas" ? "Norte" : store;
  const defaultDestStore: StoreId = defaultOriginStore === "Norte" ? "Sur" : "Norte";

  const [originStoreId, setOriginStoreId] = useState<number>(() => {
    const found = STORES.find((s) => s.name === defaultOriginStore);
    return found ? found.id : 1;
  });

  const [destStoreId, setDestStoreId] = useState<number>(() => {
    const found = STORES.find((s) => s.name === defaultDestStore);
    return found ? found.id : 2;
  });

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedLoteId, setSelectedLoteId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [motivo, setMotivo] = useState<string>("Reubicación de stock");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize when opened with initial props
  useEffect(() => {
    if (open) {
      if (initialProductId) {
        const prod = items.find((p) => p.id === initialProductId);
        if (prod) {
          setOriginStoreId(prod.tienda_id);
          setSelectedProductId(prod.id);
          const availableDest = STORES.find((s) => s.id !== prod.tienda_id);
          if (availableDest) setDestStoreId(availableDest.id);

          if (initialLoteId) {
            setSelectedLoteId(initialLoteId);
          } else {
            const firstWithStock = prod.lotes.find((l) => l.cantidad > 0);
            setSelectedLoteId(firstWithStock ? firstWithStock.id : (prod.lotes[0]?.id || ""));
          }
        }
      }
    }
  }, [open, initialProductId, initialLoteId, items]);

  // Origin products list with stock > 0
  const originProducts = useMemo(() => {
    return items
      .filter((p) => p.tienda_id === originStoreId)
      .filter((p) => p.lotes.some((l) => l.cantidad > 0))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [items, originStoreId]);

  // Filtered by search query
  const filteredOriginProducts = useMemo(() => {
    if (!searchQuery.trim()) return originProducts;
    const q = searchQuery.toLowerCase();
    return originProducts.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.articulo.toLowerCase().includes(q) ||
        (p.categoria && p.categoria.toLowerCase().includes(q))
    );
  }, [originProducts, searchQuery]);

  // Selected product object
  const selectedProduct = useMemo(() => {
    return items.find((p) => p.id === selectedProductId) || null;
  }, [items, selectedProductId]);

  // Lotes available for selected product
  const availableLotes = useMemo(() => {
    if (!selectedProduct) return [];
    return selectedProduct.lotes.filter((l) => l.cantidad > 0);
  }, [selectedProduct]);

  // Selected lote object
  const selectedLote = useMemo(() => {
    return availableLotes.find((l) => l.id === selectedLoteId) || availableLotes[0] || null;
  }, [availableLotes, selectedLoteId]);

  // Auto-select first lote when product changes
  useEffect(() => {
    if (availableLotes.length > 0) {
      if (!selectedLoteId || !availableLotes.some((l) => l.id === selectedLoteId)) {
        setSelectedLoteId(availableLotes[0].id);
      }
    } else {
      setSelectedLoteId("");
    }
  }, [availableLotes, selectedLoteId]);

  // Available destination stores (different from origin)
  const destinationStoreOptions = useMemo(() => {
    return STORES.filter((s) => s.id !== originStoreId);
  }, [originStoreId]);

  // Ensure destStoreId is always valid
  useEffect(() => {
    if (destStoreId === originStoreId) {
      const fallback = STORES.find((s) => s.id !== originStoreId);
      if (fallback) setDestStoreId(fallback.id);
    }
  }, [originStoreId, destStoreId]);

  const maxAvailable = selectedLote ? selectedLote.cantidad : 0;

  const handleOriginStoreChange = (storeIdStr: string) => {
    const newOrigId = Number(storeIdStr);
    setOriginStoreId(newOrigId);
    setSelectedProductId("");
    setSelectedLoteId("");
    setQuantity(1);
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    setQuantity(1);
  };

  const handleQuantityStepper = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxAvailable) return maxAvailable;
      return next;
    });
  };

  const handleTransfer = async () => {
    if (!selectedProduct || !selectedLote) {
      toast.error("Selecciona un producto y lote de origen.");
      return;
    }
    if (quantity <= 0 || quantity > maxAvailable) {
      toast.error(`Cantidad inválida. Debe ser entre 1 y ${maxAvailable}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await transferStock({
        origenTiendaId: originStoreId,
        destinoTiendaId: destStoreId,
        productoOrigenId: selectedProduct.id,
        loteOrigenId: selectedLote.id,
        cantidad: quantity,
        motivo: motivo.trim() || undefined,
      });
      setOpen(false);
      // Reset
      setSelectedProductId("");
      setSelectedLoteId("");
      setQuantity(1);
    } catch (e) {
      toast.error((e as Error).message || "Error al realizar el traspaso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const originStoreName = STORES.find((s) => s.id === originStoreId)?.name || "Origen";
  const destStoreName = STORES.find((s) => s.id === destStoreId)?.name || "Destino";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <Button
            variant="outline"
            className={
              isPremium
                ? "h-11 px-3 border border-border dark:border-primary/20 bg-background/50 hover:bg-muted/40 font-mono text-[11px] uppercase tracking-wider rounded-[3px] gap-2 text-primary dark:text-emerald-400"
                : "h-12 px-4 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-800 dark:text-slate-100 font-semibold rounded-xl gap-2 shadow-sm"
            }
          >
            <ArrowLeftRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isPremium ? "TRASPASO_TIENDAS" : "Traslado de Tienda"}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className={isPremium ? "max-w-2xl font-mono rounded-[4px] border-border dark:border-primary/20 bg-slate-950/95" : "max-w-2xl rounded-2xl"}>
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>{isPremium ? "CONTROL_TRASPASOS_INTER_TIENDA" : "Traspaso de Inventario entre Tiendas"}</span>
            </DialogTitle>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <Button
                variant={activeTab === "transfer" ? "default" : "ghost"}
                size="sm"
                className={`h-7 px-3 text-xs ${activeTab === "transfer" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                onClick={() => setActiveTab("transfer")}
              >
                Nuevo Traspaso
              </Button>
              <Button
                variant={activeTab === "history" ? "default" : "ghost"}
                size="sm"
                className={`h-7 px-3 text-xs ${activeTab === "history" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                Historial ({traspasos.length})
              </Button>
            </div>
          </div>
        </DialogHeader>

        {activeTab === "transfer" ? (
          <div className="space-y-4 py-2">
            {/* Step 1: Tiendas Origen y Destino */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="md:col-span-5 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {isPremium ? "TIENDA_ORIGEN (ENVÍA)" : "Tienda Origen (Envía)"}
                </Label>
                <Select value={String(originStoreId)} onValueChange={handleOriginStoreChange}>
                  <SelectTrigger className="h-11 bg-white dark:bg-slate-900 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STORES.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1 flex justify-center items-center py-1 md:py-0">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div className="md:col-span-5 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {isPremium ? "TIENDA_DESTINO (RECIBE)" : "Tienda Destino (Recibe)"}
                </Label>
                <Select value={String(destStoreId)} onValueChange={(v) => setDestStoreId(Number(v))}>
                  <SelectTrigger className="h-11 bg-white dark:bg-slate-900 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationStoreOptions.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Step 2: Selección de Producto */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isPremium ? "SELECCIONAR_PRODUCTO_ORIGEN" : "1. Seleccionar Producto en Origen"}
              </Label>
              <Input
                placeholder="Buscar producto por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 text-sm rounded-xl"
              />

              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                {filteredOriginProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No hay productos con stock disponible en {originStoreName}.
                  </div>
                ) : (
                  filteredOriginProducts.map((p) => {
                    const isSelected = p.id === selectedProductId;
                    const stock = p.lotes.reduce((acc, l) => acc + l.cantidad, 0);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleProductSelect(p.id)}
                        className={`flex items-center justify-between p-2.5 px-3 cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="truncate font-semibold">{p.nombre}</span>
                          <span className="text-[10px] text-slate-400">SKU: {p.articulo} · {p.categoria || "Otros"}</span>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                            Stock: {stock}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Step 3: Lote y Cantidad */}
            {selectedProduct && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isPremium ? "LOTE_ORIGEN_A_DESPACHAR" : "2. Lote a Despachar"}
                  </Label>
                  <Select value={selectedLoteId} onValueChange={setSelectedLoteId}>
                    <SelectTrigger className="h-11 bg-white dark:bg-slate-900 rounded-xl">
                      <SelectValue placeholder="Seleccionar lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLotes.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          Vence: {formatExpiryDate(l.fecha_caducidad)} (Disp: {l.cantidad} uds)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isPremium ? "CANTIDAD_A_TRANSFERIR" : "3. Cantidad a Transferir"}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-xl shrink-0"
                      onClick={() => handleQuantityStepper(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={maxAvailable}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.min(Math.max(1, val), maxAvailable));
                      }}
                      className="h-11 text-center font-bold text-base rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-xl shrink-0"
                      onClick={() => handleQuantityStepper(1)}
                      disabled={quantity >= maxAvailable}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">Máximo disponible: {maxAvailable} uds</p>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Motivo / Observación (Opcional)
                  </Label>
                  <Input
                    placeholder="Ej. Reabastecimiento de emergencia fin de semana"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Resumen del movimiento */}
            {selectedProduct && selectedLote && (
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>Resumen del Traspaso:</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Se transferirán <strong className="text-emerald-700 dark:text-emerald-300">{quantity} uds</strong> de{" "}
                  <strong>"{selectedProduct.nombre}"</strong> (Vencimiento: {formatExpiryDate(selectedLote.fecha_caducidad)}) desde{" "}
                  <strong>{originStoreName}</strong> hacia <strong>{destStoreName}</strong>.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Pestaña Historial de Traspasos */
          <div className="py-2 space-y-3">
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {traspasos.length === 0 ? (
                <div className="text-center p-8 text-xs text-slate-400">
                  Aún no se han registrado traspasos entre tiendas.
                </div>
              ) : (
                traspasos.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{t.nombre}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {t.cantidad} uds
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span>{t.origen_tienda_nombre}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{t.destino_tienda_nombre}</span>
                        <span>· Vence: {formatExpiryDate(t.fecha_caducidad)}</span>
                      </div>
                      {t.motivo && <p className="text-[10px] text-slate-400 italic">"{t.motivo}"</p>}
                      <p className="text-[9px] text-slate-400">
                        {format(new Date(t.created_at), "dd MMM yyyy, HH:mm", { locale: es })} · {t.usuario || "Usuario"}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => undoTraspaso(t.id)}
                      className="h-8 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1 shrink-0"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      <span>Revertir</span>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
            Cerrar
          </Button>
          {activeTab === "transfer" && (
            <Button
              onClick={handleTransfer}
              disabled={!selectedProduct || !selectedLote || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-semibold"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? "Procesando..." : "Confirmar Traslado"}</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
