import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { StoreFilter } from "@/types/inventory";

interface StoreContextValue {
  store: StoreFilter;
  setStore: (s: StoreFilter) => void;
}

import { getISOWeek } from "date-fns";

export function getRotativeStore(date: Date = new Date()): StoreFilter {
  const weekNumber = getISOWeek(date);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  
  const isOddWeek = weekNumber % 2 !== 0;
  const isEvenDay = day % 2 === 0;
  
  // Week 21 (odd): Thu(4)=even -> Norte
  if (isOddWeek) {
    return isEvenDay ? "Norte" : "Sur";
  } else {
    return isEvenDay ? "Sur" : "Norte";
  }
}

const StoreContext = createContext<StoreContextValue | null>(null);
const STORAGE_KEY = "fithub.selectedStore";
const DATE_KEY = "fithub.lastStoreDate";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStoreState] = useState<StoreFilter>(() => {
    if (typeof window === "undefined") return getRotativeStore();
    const saved = localStorage.getItem(STORAGE_KEY) as StoreFilter;
    return saved && (saved === "Sur" || saved === "Norte" || saved === "Ambas") ? saved : getRotativeStore();
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, store);
    }
  }, [store]);

  const setStore = (s: StoreFilter) => {
    setStoreState(s);
  };

  return <StoreContext.Provider value={{ store, setStore }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
