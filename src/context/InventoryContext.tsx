import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { InventoryItem, NewLoteInput, NewProductInput } from "@/types/inventory";
import { mockInventory } from "@/data/mock-inventory";
import { useStore } from "./StoreContext";

interface InventoryContextValue {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  addProduct: (input: NewProductInput) => void;
  removeProduct: (productId: string) => void;
  addLote: (productId: string, input: NewLoteInput) => void;
  removeLote: (productId: string, loteId: string) => void;
  /** Registra una venta: descuenta `qty` unidades del lote indicado. Si el lote llega a 0 se elimina. */
  sellFromLote: (productId: string, loteId: string, qty?: number) => void;
  /** Ajuste manual del lote (+1 / -1), por correcciones de conteo. */
  adjustLote: (productId: string, loteId: string, delta: number) => void;
  resetData: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);
const STORAGE_KEY = "fithub.inventory.v2";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const { store } = useStore();

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addProduct = (input: NewProductInput) => {
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        id_tienda: input.id_tienda,
        sku: input.sku,
        nombre: input.nombre,
        linea_producto: input.linea_producto,
        subcategoria_sabor: input.subcategoria_sabor,
        proveedor: input.proveedor,
        lotes: [{ id: uid(), cantidad: input.cantidad, fecha_caducidad: input.fecha_caducidad }],
      },
    ]);
  };

  const removeProduct = (productId: string) =>
    setItems((prev) => prev.filter((p) => p.id !== productId));

  const addLote = (productId: string, input: NewLoteInput) =>
    setItems((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              lotes: [
                ...p.lotes,
                { id: uid(), cantidad: input.cantidad, fecha_caducidad: input.fecha_caducidad },
              ],
            }
          : p,
      ),
    );

  const removeLote = (productId: string, loteId: string) =>
    setItems((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, lotes: p.lotes.filter((l) => l.id !== loteId) } : p,
      ),
    );

  const sellFromLote = (productId: string, loteId: string, qty = 1) =>
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextLotes = p.lotes
          .map((l) => (l.id === loteId ? { ...l, cantidad: Math.max(0, l.cantidad - qty) } : l))
          .filter((l) => l.cantidad > 0);
        return { ...p, lotes: nextLotes };
      }),
    );

  const adjustLote = (productId: string, loteId: string, delta: number) =>
    setItems((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              lotes: p.lotes.map((l) =>
                l.id === loteId ? { ...l, cantidad: Math.max(0, l.cantidad + delta) } : l,
              ),
            }
          : p,
      ),
    );

  const resetData = () => {
    setItems(mockInventory);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  const filteredItems = useMemo(
    () => (store === "Ambas" ? items : items.filter((it) => it.id_tienda === store)),
    [items, store],
  );

  return (
    <InventoryContext.Provider
      value={{
        items,
        filteredItems,
        addProduct,
        removeProduct,
        addLote,
        removeLote,
        sellFromLote,
        adjustLote,
        resetData,
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
