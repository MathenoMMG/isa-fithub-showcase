import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ProductoConLotes, Lote, NewProductInput, NewLoteInput, Producto } from "@/types/inventory";
import { supabase } from "@/lib/supabase";
import { useStore } from "./StoreContext";
import { addPendingOp } from "@/lib/offline";
import { toast } from "sonner";

export interface DeletedProduct {
  deletedAt: string;
  product: ProductoConLotes;
}

interface InventoryContextValue {
  items: ProductoConLotes[];
  filteredItems: ProductoConLotes[];
  loading: boolean;
  addProduct: (input: NewProductInput & { cantidad: number; fecha_caducidad: string | null }) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<ProductoConLotes>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  restoreProduct: (productId: string) => Promise<void>;
  clearTrashBin: () => void;
  trashBin: DeletedProduct[];
  addLote: (productId: string, input: NewLoteInput) => Promise<void>;
  removeLote: (productId: string, loteId: string) => Promise<void>;
  sellFromLote: (productId: string, loteId: string, qty?: number) => Promise<void>;
  undoSale: (productId: string, loteId: string) => Promise<boolean>;
  adjustLote: (productId: string, loteId: string, delta: number) => Promise<void>;
  updateProductCategories: (updates: Record<string, string>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

const TIENDA_MAP: Record<number, "Sur" | "Norte"> = { 1: "Norte", 2: "Sur" };

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProductoConLotes[]>([]);
  const [loading, setLoading] = useState(true);
  const { store } = useStore();
  const [trashBin, setTrashBin] = useState<DeletedProduct[]>(() => {
    try {
      const stored = localStorage.getItem("fithub_trash_bin");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error parsing trash bin:", e);
      return [];
    }
  });

  const saveTrashBin = (newTrash: DeletedProduct[]) => {
    setTrashBin(newTrash);
    try {
      localStorage.setItem("fithub_trash_bin", JSON.stringify(newTrash));
    } catch (e) {
      console.error("Error saving trash bin:", e);
    }
  };

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      // Fetch products with lotes
      const { data: productos, error: pErr } = await supabase
        .from("productos")
        .select("*, lotes(*)")
        .order("nombre");

      if (pErr) throw pErr;

      // Fetch sales totals grouped by producto_id and lote_id
      const { data: ventasTotals, error: vErr } = await supabase
        .from("ventas")
        .select("producto_id, lote_id, cantidad");

      if (vErr) throw vErr;

      // Aggregate sales per product and per lote
      const salesMap: Record<string, number> = {};
      const loteSalesMap: Record<string, number> = {};
      for (const v of ventasTotals || []) {
        salesMap[v.producto_id] = (salesMap[v.producto_id] || 0) + v.cantidad;
        if (v.lote_id) {
          loteSalesMap[v.lote_id] = (loteSalesMap[v.lote_id] || 0) + v.cantidad;
        }
      }

      const enriched: ProductoConLotes[] = (productos || []).map((p) => ({
        ...p,
        tienda_nombre: TIENDA_MAP[p.tienda_id] || "Norte",
        vendidos_total: salesMap[p.id] || 0,
        lotes: (p.lotes || [])
          .map((l: Lote) => ({
            ...l,
            vendidos: loteSalesMap[l.id] || 0,
          }))
          .sort(
            (a: Lote, b: Lote) =>
              new Date(a.fecha_caducidad || "9999-12-31").getTime() -
              new Date(b.fecha_caducidad || "9999-12-31").getTime(),
          ),
      }));

      setItems(enriched);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial
    fetchData(true);

    // Polling cada 10 segundos para mantener sincronizadas las sesiones en tiempo real
    const interval = setInterval(() => {
      fetchData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const addProduct = async (
    input: NewProductInput & { cantidad: number; fecha_caducidad: string | null },
  ) => {
    try {
      if (!window.navigator.onLine) {
        throw new Error("offline");
      }
      
      const { cantidad, fecha_caducidad, ...productData } = input;
      const { data: product, error: pErr } = await supabase
        .from("productos")
        .insert(productData)
        .select()
        .single();

      if (pErr) throw pErr;

      if (cantidad > 0) {
        const { error: lErr } = await supabase.from("lotes").insert({
          producto_id: product.id,
          cantidad,
          fecha_caducidad: fecha_caducidad || null,
        });
        if (lErr) throw lErr;
      }

      await fetchData();
    } catch (err) {
      console.warn("Error adding product, saving offline:", err);
      addPendingOp('add_product', input);
      toast.warning("Sin conexión: Producto guardado localmente en cola.");
    }
  };

  const removeProduct = async (productId: string) => {
    const productToDelete = items.find((item) => item.id === productId);
    if (productToDelete) {
      const deletedItem: DeletedProduct = {
        deletedAt: new Date().toISOString(),
        product: productToDelete,
      };
      const updatedTrash = [deletedItem, ...trashBin.filter(t => t.product.id !== productId)].slice(0, 50);
      saveTrashBin(updatedTrash);
    }

    const { error } = await supabase.from("productos").delete().eq("id", productId);
    if (error) throw error;
    await fetchData();
  };

  const restoreProduct = async (productId: string) => {
    const deletedEntry = trashBin.find((t) => t.product.id === productId);
    if (!deletedEntry) {
      throw new Error("Producto no encontrado en la papelera");
    }

    const { product } = deletedEntry;

    try {
      const { error: pErr } = await supabase
        .from("productos")
        .insert({
          id: product.id,
          tienda_id: product.tienda_id,
          articulo: product.articulo,
          sicol: product.sicol,
          nombre: product.nombre,
          categoria: product.categoria,
          proveedor_nombre: product.proveedor_nombre,
          proveedor_codigo: product.proveedor_codigo,
          notas: product.notas,
        });

      if (pErr) throw pErr;

      if (product.lotes && product.lotes.length > 0) {
        const lotesToInsert = product.lotes.map((l) => ({
          id: l.id,
          producto_id: product.id,
          cantidad: l.cantidad,
          fecha_caducidad: l.fecha_caducidad,
          fecha_ingreso: l.fecha_ingreso,
          notas: l.notas,
        }));

        const { error: lErr } = await supabase.from("lotes").insert(lotesToInsert);
        if (lErr) throw lErr;
      }

      const updatedTrash = trashBin.filter((t) => t.product.id !== productId);
      saveTrashBin(updatedTrash);

      await fetchData();
      toast.success(`Producto "${product.nombre}" restaurado exitosamente.`);
    } catch (err) {
      console.error("Error restoring product:", err);
      toast.error(`Error al restaurar "${product.nombre}": ` + (err as Error).message);
      throw err;
    }
  };

  const clearTrashBin = () => {
    saveTrashBin([]);
    toast.success("Papelera de reciclaje vaciada.");
  };

  const updateProduct = async (productId: string, updates: Partial<Producto>) => {
    const { error } = await supabase.from("productos").update(updates).eq("id", productId);
    if (error) throw error;
    await fetchData(true); // skip loading state for smooth UI
  };

  const addLote = async (productId: string, input: NewLoteInput) => {
    try {
      if (!window.navigator.onLine) {
        throw new Error("offline");
      }
      const { error } = await supabase.from("lotes").insert({
        producto_id: productId,
        cantidad: input.cantidad,
        fecha_caducidad: input.fecha_caducidad || null,
      });
      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.warn("Error adding lote, saving offline:", err);
      addPendingOp('add_lote', { producto_id: productId, cantidad: input.cantidad, fecha_caducidad: input.fecha_caducidad });
      toast.warning("Sin conexión: Nuevo lote guardado localmente en cola.");
    }
  };

  const removeLote = async (_productId: string, loteId: string) => {
    const { error } = await supabase.from("lotes").delete().eq("id", loteId);
    if (error) throw error;
    await fetchData();
  };

  const sellFromLote = async (productId: string, loteId: string, qty = 1) => {
    try {
      if (!window.navigator.onLine) {
        throw new Error("offline");
      }
      // Record the sale
      const { error: vErr } = await supabase.from("ventas").insert({
        producto_id: productId,
        lote_id: loteId,
        cantidad: qty,
      });
      if (vErr) throw vErr;

      // Decrement lote quantity
      const lote = items
        .find((p) => p.id === productId)
        ?.lotes.find((l) => l.id === loteId);

      if (lote) {
        const newQty = Math.max(0, lote.cantidad - qty);
        const { error: lErr } = await supabase
          .from("lotes")
          .update({ cantidad: newQty })
          .eq("id", loteId);
        if (lErr) throw lErr;
      }

      await fetchData();
    } catch (err) {
      console.warn("Error registering sale, saving offline:", err);
      addPendingOp('sell', { producto_id: productId, lote_id: loteId, cantidad: qty });
      toast.warning("Sin conexión: Venta guardada localmente.");
      
      // Optimistic UI Update
      setItems(prev => prev.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          lotes: p.lotes.map(l => {
            if (l.id !== loteId) return l;
            return { ...l, cantidad: Math.max(0, l.cantidad - qty) };
          })
        };
      }));
    }
  };

  const undoSale = async (productId: string, loteId: string): Promise<boolean> => {
    // Buscar la última venta de este lote
    const { data: lastSale, error: fetchErr } = await supabase
      .from("ventas")
      .select("*")
      .eq("lote_id", loteId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!lastSale) return false; // No hay venta que deshacer

    // Eliminar la venta
    const { error: delErr } = await supabase
      .from("ventas")
      .delete()
      .eq("id", lastSale.id);
    if (delErr) throw delErr;

    // Restaurar cantidad en lote
    const lote = items
      .find((p) => p.id === productId)
      ?.lotes.find((l) => l.id === loteId);

    if (lote) {
      const newQty = lote.cantidad + lastSale.cantidad;
      const { error: lErr } = await supabase
        .from("lotes")
        .update({ cantidad: newQty })
        .eq("id", loteId);
      if (lErr) throw lErr;
    }

    await fetchData();
    return true;
  };

  const adjustLote = async (productId: string, loteId: string, delta: number) => {
    try {
      if (!window.navigator.onLine) {
        throw new Error("offline");
      }
      // Find current quantity
      const currentLote = items
        .flatMap((p) => p.lotes)
        .find((l) => l.id === loteId);

      if (currentLote) {
        const newQty = Math.max(0, currentLote.cantidad + delta);
        const { error } = await supabase
          .from("lotes")
          .update({ cantidad: newQty })
          .eq("id", loteId);
        if (error) throw error;
        await fetchData();
      }
    } catch (err) {
      console.warn("Error adjusting stock, saving offline:", err);
      addPendingOp('adjust', { lote_id: loteId, delta });
      toast.warning("Sin conexión: Ajuste guardado localmente.");

      // Optimistic UI Update
      setItems(prev => prev.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          lotes: p.lotes.map(l => {
            if (l.id !== loteId) return l;
            return { ...l, cantidad: Math.max(0, l.cantidad + delta) };
          })
        };
      }));
    }
  };

  const updateProductCategories = async (updates: Record<string, string>) => {
    const promises = Object.entries(updates).map(([productId, newCategory]) =>
      supabase
        .from("productos")
        .update({ categoria: newCategory })
        .eq("id", productId)
    );
    
    // Execute all updates in parallel
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    
    if (errors.length > 0) {
      console.error("Errors updating categories:", errors);
      throw new Error("Ocurrió un error al actualizar algunas categorías.");
    }
    
    await fetchData();
  };

  const filteredItems = useMemo(
    () =>
      store === "Ambas"
        ? items
        : items.filter((it) => it.tienda_nombre === store),
    [items, store],
  );

  return (
    <InventoryContext.Provider
      value={{
        items,
        filteredItems,
        loading,
        addProduct,
        updateProduct,
        removeProduct,
        restoreProduct,
        clearTrashBin,
        trashBin,
        addLote,
        removeLote,
        sellFromLote,
        undoSale,
        adjustLote,
        updateProductCategories,
        refreshData: fetchData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
