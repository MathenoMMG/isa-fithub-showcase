import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { InventoryItem } from "@/types/inventory";
import { mockInventory } from "@/data/mock-inventory";
import { useStore } from "./StoreContext";

interface InventoryContextValue {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  incrementStock: (id: string) => void;
  decrementStock: (id: string) => void;
  resetData: () => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);
const STORAGE_KEY = "fithub.inventory";

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

  const incrementStock = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, cantidad: it.cantidad + 1 } : it)));

  const decrementStock = (id: string) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, cantidad: Math.max(0, it.cantidad - 1) } : it)),
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
    <InventoryContext.Provider value={{ items, filteredItems, incrementStock, decrementStock, resetData }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
