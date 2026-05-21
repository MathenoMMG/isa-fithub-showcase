import { useState } from "react";
import { ChevronDown, ChevronRight, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface Props {
  product: ProductoConLotes;
  defaultOpen?: boolean;
}

const statusBg: Record<ReturnType<typeof getWorstStatus>, string> = {
  vencido: "border-l-red-500",
  proximo: "border-l-amber-500",
  en_regla: "border-l-emerald-500",
};

export function ProductRow({ product, defaultOpen = false }: Props) {
  const { sellFromLote, adjustLote, removeLote, removeProduct } = useInventory();
  const [open, setOpen] = useState(defaultOpen);

  const total = getTotalQty(product.lotes);
  const worst = getWorstStatus(product.lotes);
  const earliest = getEarliestExpiry(product.lotes);
  const sortedLotes = [...product.lotes].sort(
    (a, b) => new Date(a.fecha_caducidad).getTime() - new Date(b.fecha_caducidad).getTime(),
  );

  return (
    <div className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 ${statusBg[worst]} shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:hover:bg-slate-800/50`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="h-10 w-10 rounded-xl hover:bg-slate-100 flex items-center justify-center shrink-0"
          aria-label={open ? "Colapsar" : "Expandir"}
        >
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-base truncate">{product.nombre}</span>
            <Badge variant="outline" className="border-slate-300 text-slate-600 text-xs">
              {product.categoria || "Otros"}
            </Badge>
            <Badge variant="outline" className="border-slate-300 text-slate-500 text-xs font-mono">
              {product.articulo}
            </Badge>
            <Badge variant="outline" className="border-slate-300 text-slate-600 text-xs">
              {product.tienda_nombre}
            </Badge>
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {product.lotes.length} lote{product.lotes.length === 1 ? "" : "s"}
            {earliest && <> · próx. vence {formatExpiryDate(earliest)}</>}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{total}</div>
          <div className="text-xs text-slate-500">unidades</div>
        </div>
      </div>

      {/* Lotes */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4 space-y-2">
          {sortedLotes.length === 0 && (
            <div className="text-sm text-slate-500 italic px-2 py-3">Sin lotes en stock.</div>
          )}

          {sortedLotes.map((lote, idx) => {
            const status = getExpiryStatus(lote.fecha_caducidad);
            return (
              <div
                key={lote.id}
                className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col md:flex-row md:items-center gap-3"
              >
                {/* índice + caducidad */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 tabular-nums">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 tabular-nums">
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
                  <div className="flex flex-col gap-1 mr-2">
                    <Button
                      onClick={() => {
                        if (lote.cantidad <= 0) {
                          toast.error("Lote sin stock");
                          return;
                        }
                        sellFromLote(product.id, lote.id, 1);
                        toast.success(`Venta registrada · ${product.nombre} (lote #${idx + 1})`, {
                          description:
                            status === "vencido"
                              ? "⚠️ Este lote estaba vencido — verifica antes de despachar."
                              : undefined,
                        });
                      }}
                      className="h-11 px-4 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Venta
                    </Button>
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
                      toast.success(`Producto "${product.nombre}" eliminado`);
                    }}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}
