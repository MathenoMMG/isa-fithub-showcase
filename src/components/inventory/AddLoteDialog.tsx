import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { useInventory } from "@/context/InventoryContext";

interface Props {
  productId: string;
  productName: string;
}

export function AddLoteDialog({ productId, productName }: Props) {
  const { addLote } = useInventory();
  const [open, setOpen] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [fecha, setFecha] = useState(new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));

  const submit = () => {
    if (cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    addLote(productId, {
      cantidad: Number(cantidad),
      fecha_caducidad: new Date(fecha).toISOString(),
    });
    toast.success(`Nuevo lote añadido a ${productName}`);
    setOpen(false);
    setCantidad(1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        >
          <PackagePlus className="h-4 w-4" />
          Añadir lote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo lote · {productName}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Cantidad</Label>
            <Input className="h-11" type="number" min={1} inputMode="numeric" pattern="[0-9]*" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Caducidad</Label>
            <Input className="h-11" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submit}>
            Guardar lote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
