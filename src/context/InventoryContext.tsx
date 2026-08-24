import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ProductoConLotes, Lote, NewProductInput, NewLoteInput, Producto, Merma, MotivoMerma, StoreId, Traspaso, TraspasoInput } from "@/types/inventory";
import { useStore } from "./StoreContext";
import { useAuth } from "./AuthContext";
import { addPendingOp } from "@/lib/offline";
import { toast } from "sonner";

// ── Service layer imports ────────────────────────────────────────────
import {
  fetchInventory,
  createProduct as svcCreateProduct,
  deleteProduct as svcDeleteProduct,
  restoreProduct as svcRestoreProduct,
  updateProduct as svcUpdateProduct,
  updateProductCategories as svcUpdateCategories,
  createLote as svcCreateLote,
  deleteLote as svcDeleteLote,
  adjustLoteQuantity,
  recordSale,
  undoLastSale,
} from "@/services/inventory.service";

import {
  fetchMermas as svcFetchMermas,
  registerMerma as svcRegisterMerma,
  undoMerma as svcUndoMerma,
} from "@/services/mermas.service";

import {
  fetchTraspasos as svcFetchTraspasos,
  executeTransfer,
  saveTraspasosLog,
  undoTransfer,
} from "@/services/transfers.service";

// ── Types ────────────────────────────────────────────────────────────

export interface DeletedProduct {
  deletedAt: string;
  product: ProductoConLotes;
}

interface InventoryContextValue {
  items: ProductoConLotes[];
  filteredItems: ProductoConLotes[];
  mermas: Merma[];
  traspasos: Traspaso[];
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
  registerMerma: (productId: string, loteId: string | null, cantidad: number, motivo: MotivoMerma, notas?: string) => Promise<void>;
  undoMerma: (mermaId: string) => Promise<boolean>;
  adjustLote: (productId: string, loteId: string, delta: number) => Promise<void>;
  transferStock: (input: TraspasoInput) => Promise<void>;
  undoTraspaso: (traspasoId: string) => Promise<boolean>;
  updateProductCategories: (updates: Record<string, string>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProductoConLotes[]>([]);
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [traspasos, setTraspasos] = useState<Traspaso[]>([]);
  const [loading, setLoading] = useState(true);
  const { store } = useStore();
  const { isAuthenticated, user } = useAuth();
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

  // ── Data Fetcher (delegates to services) ───────────────────────────

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [enriched, mermasData, traspasosData] = await Promise.all([
        fetchInventory(),
        svcFetchMermas(),
        svcFetchTraspasos(),
      ]);

      setItems(enriched);
      setMermas(mermasData);
      setTraspasos(traspasosData);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }

    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchData, isAuthenticated]);

  // ── Product Operations ─────────────────────────────────────────────

  const addProduct = async (
    input: NewProductInput & { cantidad: number; fecha_caducidad: string | null },
  ) => {
    try {
      if (!window.navigator.onLine) throw new Error("offline");
      await svcCreateProduct(input);
      await fetchData();
    } catch (err) {
      console.warn("Error adding product, saving offline:", err);
      addPendingOp("add_product", input);
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
      const updatedTrash = [deletedItem, ...trashBin.filter((t) => t.product.id !== productId)].slice(0, 50);
      saveTrashBin(updatedTrash);
    }

    await svcDeleteProduct(productId);
    await fetchData();
  };

  const restoreProductHandler = async (productId: string) => {
    const deletedEntry = trashBin.find((t) => t.product.id === productId);
    if (!deletedEntry) throw new Error("Producto no encontrado en la papelera");

    try {
      await svcRestoreProduct(deletedEntry.product);
      const updatedTrash = trashBin.filter((t) => t.product.id !== productId);
      saveTrashBin(updatedTrash);
      await fetchData();
      toast.success(`Producto "${deletedEntry.product.nombre}" restaurado exitosamente.`);
    } catch (err) {
      console.error("Error restoring product:", err);
      toast.error(`Error al restaurar "${deletedEntry.product.nombre}": ` + (err as Error).message);
      throw err;
    }
  };

  const clearTrashBin = () => {
    saveTrashBin([]);
    toast.success("Papelera de reciclaje vaciada.");
  };

  const updateProductHandler = async (productId: string, updates: Partial<Producto>) => {
    await svcUpdateProduct(productId, updates);
    await fetchData(true);
  };

  const updateProductCategories = async (updates: Record<string, string>) => {
    await svcUpdateCategories(updates);
    await fetchData();
  };

  // ── Lote Operations ────────────────────────────────────────────────

  const addLote = async (productId: string, input: NewLoteInput) => {
    try {
      if (!window.navigator.onLine) throw new Error("offline");
      await svcCreateLote(productId, input);
      await fetchData();
    } catch (err) {
      console.warn("Error adding lote, saving offline:", err);
      addPendingOp("add_lote", { producto_id: productId, cantidad: input.cantidad, fecha_caducidad: input.fecha_caducidad });
      toast.warning("Sin conexión: Nuevo lote guardado localmente en cola.");
    }
  };

  const removeLote = async (_productId: string, loteId: string) => {
    await svcDeleteLote(loteId);
    await fetchData();
  };

  // ── Sales ──────────────────────────────────────────────────────────

  const sellFromLote = async (productId: string, loteId: string, qty = 1) => {
    try {
      if (!window.navigator.onLine) throw new Error("offline");

      await recordSale(productId, loteId, qty);

      const lote = items.find((p) => p.id === productId)?.lotes.find((l) => l.id === loteId);
      if (lote) {
        const newQty = Math.max(0, lote.cantidad - qty);
        await adjustLoteQuantity(loteId, newQty);
      }

      await fetchData();
    } catch (err) {
      console.warn("Error registering sale, saving offline:", err);
      addPendingOp("sell", { producto_id: productId, lote_id: loteId, cantidad: qty });
      toast.warning("Sin conexión: Venta guardada localmente.");

      // Optimistic UI Update
      setItems((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            lotes: p.lotes.map((l) => {
              if (l.id !== loteId) return l;
              return { ...l, cantidad: Math.max(0, l.cantidad - qty) };
            }),
          };
        }),
      );
    }
  };

  const undoSale = async (productId: string, loteId: string): Promise<boolean> => {
    const result = await undoLastSale(loteId);
    if (!result.found) return false;

    const lote = items.find((p) => p.id === productId)?.lotes.find((l) => l.id === loteId);
    if (lote) {
      const newQty = lote.cantidad + result.cantidad;
      await adjustLoteQuantity(loteId, newQty);
    }

    await fetchData();
    return true;
  };

  // ── Stock Adjustment ───────────────────────────────────────────────

  const adjustLote = async (productId: string, loteId: string, delta: number) => {
    try {
      if (!window.navigator.onLine) throw new Error("offline");

      const currentLote = (items || []).flatMap((p) => p?.lotes || []).find((l) => l && l.id === loteId);
      if (currentLote) {
        const newQty = Math.max(0, currentLote.cantidad + delta);
        await adjustLoteQuantity(loteId, newQty);
        await fetchData();
      }
    } catch (err) {
      console.warn("Error adjusting stock, saving offline:", err);
      addPendingOp("adjust", { lote_id: loteId, delta });
      toast.warning("Sin conexión: Ajuste guardado localmente.");

      // Optimistic UI Update
      setItems((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            lotes: p.lotes.map((l) => {
              if (l.id !== loteId) return l;
              return { ...l, cantidad: Math.max(0, l.cantidad + delta) };
            }),
          };
        }),
      );
    }
  };

  // ── Mermas (delegates to mermas.service) ───────────────────────────

  const registerMermaHandler = async (
    productId: string,
    loteId: string | null,
    cantidad: number,
    motivo: MotivoMerma,
    notas?: string,
  ) => {
    const product = items.find((p) => p.id === productId);
    if (!product) throw new Error("Producto no encontrado");

    const usuario = user?.user_metadata?.name || user?.email || "Usuario";

    // Optimistic UI update for merma list
    const optimisticMerma: Merma = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      producto_id: productId,
      lote_id: loteId,
      tienda_id: product.tienda_id,
      cantidad,
      motivo,
      notas: notas || null,
      created_at: new Date().toISOString(),
      usuario,
    };

    // Resolve FEFO target for optimistic UI
    let targetLoteId = loteId;
    if (!targetLoteId) {
      const activeLotes = [...product.lotes]
        .filter((l) => l.cantidad > 0)
        .sort((a, b) => new Date(a.fecha_caducidad || "9999").getTime() - new Date(b.fecha_caducidad || "9999").getTime());
      if (activeLotes.length > 0) {
        targetLoteId = activeLotes[0].id;
        optimisticMerma.lote_id = targetLoteId;
      }
    }

    setMermas((prev) => [optimisticMerma, ...prev]);
    if (targetLoteId) {
      setItems((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            lotes: p.lotes.map((l) => {
              if (l.id !== targetLoteId) return l;
              return { ...l, cantidad: Math.max(0, l.cantidad - cantidad) };
            }),
          };
        }),
      );
    }

    try {
      if (!window.navigator.onLine) throw new Error("offline");

      await svcRegisterMerma(
        { productId, loteId, cantidad, motivo, notas, usuario },
        product,
        mermas,
      );

      await fetchData();
      toast.success(`Merma registrada: -${cantidad} uds (${motivo.replace("_", " ")})`);
    } catch (err) {
      console.warn("Sin conexión o error al registrar merma, encolando offline:", err);
      addPendingOp("merma", { merma: optimisticMerma, lote_id: loteId, cantidad });
      toast.warning("Sin conexión: Merma registrada en cola local.");
    }
  };

  const undoMermaHandler = async (mermaId: string): Promise<boolean> => {
    try {
      const filtered = await svcUndoMerma(mermaId, mermas, items);
      setMermas(filtered);
      await fetchData();
      toast.success("Merma deshecha y stock restaurado");
      return true;
    } catch (err) {
      console.error("Error undoing merma:", err);
      toast.error("No se pudo deshacer la merma");
      return false;
    }
  };

  // ── Transfers (delegates to transfers.service) ─────────────────────

  const transferStock = async (input: TraspasoInput) => {
    const usuario = user?.user_metadata?.name || user?.email || "Usuario";
    const { traspaso } = await executeTransfer(input, items, usuario);

    const updatedTraspasos = [traspaso, ...traspasos];
    setTraspasos(updatedTraspasos);

    try {
      await saveTraspasosLog(updatedTraspasos);
    } catch (e) {
      console.error("Error saving traspasos log to Supabase:", e);
    }

    await fetchData();
    toast.success(
      `Traspaso exitoso: ${input.cantidad} uds de "${traspaso.nombre}" a ${traspaso.destino_tienda_nombre}`,
    );
  };

  const undoTraspasoHandler = async (traspasoId: string): Promise<boolean> => {
    try {
      const filtered = await undoTransfer(traspasoId, traspasos, items);
      setTraspasos(filtered);
      await fetchData();
      toast.success("Traspaso revertido exitosamente.");
      return true;
    } catch (err) {
      console.error("Error undoing traspaso:", err);
      toast.error("No se pudo revertir el traspaso.");
      return false;
    }
  };

  // ── Filtered view ──────────────────────────────────────────────────

  const filteredItems = useMemo(
    () =>
      store === "Ambas" || store === "Todas"
        ? items
        : items.filter((it) => it.tienda_nombre === store),
    [items, store],
  );

  // ── Provider ───────────────────────────────────────────────────────

  return (
    <InventoryContext.Provider
      value={{
        items,
        filteredItems,
        mermas,
        traspasos,
        loading,
        addProduct,
        updateProduct: updateProductHandler,
        removeProduct,
        restoreProduct: restoreProductHandler,
        clearTrashBin,
        trashBin,
        addLote,
        removeLote,
        sellFromLote,
        undoSale,
        registerMerma: registerMermaHandler,
        undoMerma: undoMermaHandler,
        adjustLote,
        transferStock,
        undoTraspaso: undoTraspasoHandler,
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
