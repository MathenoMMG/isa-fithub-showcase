import { useState, useMemo } from "react";
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

const DEFAULT_CATEGORIAS = ["Arepas", "Lácteos", "Snacks", "Bebidas", "Suplementos", "Despensa", "Panadería", "Cereales", "Confitería", "Quesos", "Frutos y Nueces", "Accesorios", "Otros"];
const STORE_MAP: Record<StoreId, number> = { Norte: 1, Sur: 2 };

export function AddProductDialog() {
  const { addProduct, filteredItems } = useInventory();
  const { store } = useStore();
  const [open, setOpen] = useState(false);

  const defaultStore: StoreId = store === "Ambas" ? "Norte" : store;

  const allCategorias = useMemo(() => {
    const existing = filteredItems.map(i => i.categoria).filter(Boolean);
    const unique = Array.from(new Set([...DEFAULT_CATEGORIAS, ...existing]));
    return unique.sort();
  }, [filteredItems]);

  const [form, setForm] = useState({
    nombre: "",
    articulo: "",
    sicol: "",
    categoria: DEFAULT_CATEGORIAS[0],
    proveedor_nombre: "ADWELLCH S.A.S.",
    tienda_id: STORE_MAP[defaultStore],
    cantidad: 1,
    fecha_caducidad: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  });

  const [isNewCategory, setIsNewCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const reset = () => {
    setForm({
      nombre: "",
      articulo: "",
      sicol: "",
      categoria: DEFAULT_CATEGORIAS[0],
      proveedor_nombre: "ADWELLCH S.A.S.",
      tienda_id: STORE_MAP[defaultStore],
      cantidad: 1,
      fecha_caducidad: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    });
    setIsNewCategory(false);
    setCustomCategory("");
  };

  const submit = () => {
    const finalCategory = isNewCategory ? customCategory : form.categoria;

    if (!form.nombre.trim() || !form.articulo.trim()) {
      toast.error("Nombre y Código (Artículo) son obligatorios");
      return;
    }
    if (!finalCategory.trim()) {
      toast.error("La categoría es obligatoria");
      return;
    }

    addProduct({
      ...form,
      categoria: finalCategory,
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
            <Label>Nombre del producto</Label>
            <Input className="h-11" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Artículo (Código barras)</Label>
            <Input className="h-11" value={form.articulo} onChange={(e) => setForm({ ...form, articulo: e.target.value.toUpperCase() })} />
          </div>
          <div className="space-y-1.5">
            <Label>Sicol</Label>
            <Input className="h-11" value={form.sicol} onChange={(e) => setForm({ ...form, sicol: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select 
              value={isNewCategory ? "NEW" : form.categoria} 
              onValueChange={(v) => {
                if (v === "NEW") {
                  setIsNewCategory(true);
                  setForm({ ...form, categoria: "" });
                } else {
                  setIsNewCategory(false);
                  setForm({ ...form, categoria: v });
                }
              }}
            >
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {allCategorias.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                <SelectItem value="NEW" className="font-semibold text-emerald-600">Crear nueva categoría...</SelectItem>
              </SelectContent>
            </Select>
            {isNewCategory && (
              <Input 
                className="h-11 mt-2" 
                placeholder="Escribe la nueva categoría" 
                value={customCategory} 
                onChange={(e) => setCustomCategory(e.target.value)} 
                autoFocus
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Tienda</Label>
            <Select value={String(form.tienda_id)} onValueChange={(v) => setForm({ ...form, tienda_id: Number(v) })}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Sur</SelectItem>
                <SelectItem value="1">Norte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Proveedor</Label>
            <Input className="h-11" value={form.proveedor_nombre} onChange={(e) => setForm({ ...form, proveedor_nombre: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Cantidad inicial</Label>
            <Input className="h-11" type="number" min={0} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>Caducidad (lote inicial)</Label>
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
