import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useInventory } from "@/context/InventoryContext";
import { useStore } from "@/context/StoreContext";
import type { StoreId } from "@/types/inventory";

const LINEAS = ["Proteínas", "Pre-entrenos", "Snacks", "Bebidas", "Accesorios"];

export function AddProductDialog() {
  const { addProduct } = useInventory();
  const { store } = useStore();
  const [open, setOpen] = useState(false);

  const defaultStore: StoreId = store === "Ambas" ? "Sur" : store;

  const [form, setForm] = useState({
    nombre: "",
    sku: "",
    subcategoria_sabor: "",
    linea_producto: LINEAS[0],
    proveedor: "",
    id_tienda: defaultStore,
    cantidad: 1,
    fecha_caducidad: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  });

  const reset = () =>
    setForm({
      nombre: "",
      sku: "",
      subcategoria_sabor: "",
      linea_producto: LINEAS[0],
      proveedor: "",
      id_tienda: defaultStore,
      cantidad: 1,
      fecha_caducidad: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    });

  const submit = () => {
    if (!form.nombre.trim() || !form.sku.trim()) {
      toast.error("Nombre y SKU son obligatorios");
      return;
    }
    addProduct({
      ...form,
      cantidad: Number(form.cantidad) || 0,
      fecha_caducidad: new Date(form.fecha_caducidad).toISOString(),
    });
    toast.success(`Producto "${form.nombre}" añadido`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold gap-2 rounded-xl shadow-sm">
          <Plus className="h-5 w-5" />
          Añadir Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo producto</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2 space-y-1.5">
            <Label>Nombre</Label>
            <Input className="h-11" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>SKU</Label>
            <Input className="h-11" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} />
          </div>
          <div className="space-y-1.5">
            <Label>Sabor / Subcategoría</Label>
            <Input className="h-11" value={form.subcategoria_sabor} onChange={(e) => setForm({ ...form, subcategoria_sabor: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Línea</Label>
            <Select value={form.linea_producto} onValueChange={(v) => setForm({ ...form, linea_producto: v })}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LINEAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tienda</Label>
            <Select value={form.id_tienda} onValueChange={(v) => setForm({ ...form, id_tienda: v as StoreId })}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Sur">Sur</SelectItem>
                <SelectItem value="Norte">Norte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Proveedor</Label>
            <Input className="h-11" value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Cantidad lote inicial</Label>
            <Input className="h-11" type="number" min={0} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>Caducidad</Label>
            <Input className="h-11" type="date" value={form.fecha_caducidad} onChange={(e) => setForm({ ...form, fecha_caducidad: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submit}>
            Guardar producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
