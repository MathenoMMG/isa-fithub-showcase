import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertOctagon, Sparkles } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import type { MotivoMerma, ProductoConLotes, Lote } from "@/types/inventory";
import { toast } from "sonner";

interface MermaDialogProps {
  product: ProductoConLotes;
  lote?: Lote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MermaDialog({ product, lote, open, onOpenChange }: MermaDialogProps) {
  const { registerMerma } = useInventory();
  const maxQty = lote ? lote.cantidad : product.lotes.reduce((acc, l) => acc + l.cantidad, 0);

  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState<MotivoMerma>("caducidad");
  const [notas, setNotas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    if (cantidad > maxQty) {
      toast.error(`Solo hay ${maxQty} unidades disponibles`);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerMerma(product.id, lote?.id || null, cantidad, motivo, notas);
      onOpenChange(false);
      setCantidad(1);
      setNotas("");
    } catch (e) {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertOctagon className="h-5 w-5" />
            Registrar Merma / Pérdida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-left">
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs space-y-1">
            <p className="font-bold text-red-900 dark:text-red-300 truncate">{product.nombre}</p>
            <p className="text-red-700 dark:text-red-400">
              Sede: <span className="font-semibold">{product.tienda_nombre}</span> · Stock disponible: <span className="font-bold">{maxQty} uds</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Motivo de la merma</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoMerma)}>
              <SelectTrigger className="h-11 rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caducidad">⌛ Caducidad / Vencimiento</SelectItem>
                <SelectItem value="perdida_bodega">📦 Pérdida en bodega / No exhibido</SelectItem>
                <SelectItem value="averia">⚠️ Avería / Empaque dañado</SelectItem>
                <SelectItem value="descuadre">🔍 Descuadre en conteo físico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Cantidad de unidades a dar de baja</Label>
            <Input
              type="number"
              min={1}
              max={maxQty}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
              className="h-11 rounded-xl font-mono text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Detalle / Notas de la pérdida (opcional)</Label>
            <Input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Encontrado al fondo de la repisa..."
              className="h-11 rounded-xl text-sm"
              maxLength={150}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-11 text-xs">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || maxQty <= 0}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 text-xs font-bold"
          >
            {isSubmitting ? "Registrando..." : `Confirmar Merma (-${cantidad} uds)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
