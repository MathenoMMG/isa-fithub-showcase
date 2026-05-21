import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { StoreFilter } from "@/types/inventory";

interface StoreContextValue {
  store: StoreFilter;
  setStore: (s: StoreFilter) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);
const STORAGE_KEY = "fithub.selectedStore";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStoreState] = useState<StoreFilter>("Ambas");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "Sur" || saved === "Norte" || saved === "Ambas") {
      setStoreState(saved);
    }
  }, []);

  const setStore = (s: StoreFilter) => {
    setStoreState(s);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, s);
  };

  return <StoreContext.Provider value={{ store, setStore }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
