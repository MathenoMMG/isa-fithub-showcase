import { useState, useEffect } from "react";

export function useFavorites(storageKey: string, maxItems: number = 2) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      let newFavs;
      if (prev.includes(id)) {
        newFavs = prev.filter((f) => f !== id);
      } else {
        if (prev.length >= maxItems) {
          // Remove the oldest one to add the new one, or just ignore. 
          // Let's remove the first one to make room.
          newFavs = [...prev.slice(1), id];
        } else {
          newFavs = [...prev, id];
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(newFavs));
      return newFavs;
    });
  };

  return { favorites, toggleFavorite };
}
