import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

type ThemeMode = "light" | "dark" | "system";

export const DEFAULT_STORE_PHOTOS: Record<string, string> = {
  Norte: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000&auto=format&fit=crop",
  Sur: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
  Centro: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop",
};

interface Profile {
  name: string;
  subtitle: string;
  avatar: string; // Base64 image or URL
  soundEnabled: boolean;
  glowEnabled: boolean;
  stylePreset?: "classic" | "obsidian";
  fontPreset?: "jakarta" | "sans" | "serif";
  storePhotos?: Record<string, string>;
}

interface ProfileContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  profile: Profile;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  playBeep: () => void;
}

const defaultProfile: Profile = {
  name: "Usuario",
  subtitle: "Punto de Venta",
  avatar: "",
  soundEnabled: true,
  glowEnabled: true,
  stylePreset: "classic",
  fontPreset: "jakarta",
  storePhotos: DEFAULT_STORE_PHOTOS,
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const CONFIG_RECORD_ID = "00000000-0000-0000-0000-000000000001";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userEmail = user?.email || "guest";
  const profileStorageKey = `fithub-profile-${userEmail}`;

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("fithub-theme") as ThemeMode) || "system";
  });

  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultProfile;
  });

  // 1. Cargar fotos públicas globales desde Supabase
  useEffect(() => {
    async function fetchGlobalStorePhotos() {
      try {
        const { data, error } = await supabase
          .from("visitas")
          .select("notas")
          .eq("id", CONFIG_RECORD_ID)
          .maybeSingle();

        if (error) {
          console.error("Error fetching global store photos:", error);
          return;
        }

        if (data && data.notas) {
          try {
            const parsed = JSON.parse(data.notas);
            setProfile((prev) => ({
              ...prev,
              storePhotos: {
                ...DEFAULT_STORE_PHOTOS,
                ...parsed,
              },
            }));
          } catch (e) {}
        }
      } catch (err) {
        console.error("Error loading store photos from DB:", err);
      }
    }

    fetchGlobalStorePhotos();

    // Polling cada 30 segundos para sincronizar fotos si otro usuario las cambia
    const interval = setInterval(fetchGlobalStorePhotos, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. Sincronizar cuando el usuario autenticado cambia o llegan metadatos de Supabase
  useEffect(() => {
    if (!user) return;

    if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
      setProfile((prev) => ({
        ...prev,
        name: user.user_metadata.name || prev.name,
        subtitle: user.user_metadata.subtitle || prev.subtitle,
        avatar: user.user_metadata.avatar || prev.avatar,
        soundEnabled: user.user_metadata.soundEnabled ?? prev.soundEnabled,
        glowEnabled: user.user_metadata.glowEnabled ?? prev.glowEnabled,
        stylePreset: user.user_metadata.stylePreset || prev.stylePreset,
        fontPreset: user.user_metadata.fontPreset || prev.fontPreset,
      }));
    }
  }, [user]);

  // Aplicar clases visuales dinámicas
  useEffect(() => {
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    } catch (e) {}

    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("font-jakarta", "font-sans-preset", "font-serif-preset");

      if (profile.stylePreset === "obsidian") {
        root.classList.add("style-obsidian");
        const font = profile.fontPreset || "jakarta";
        if (font === "jakarta") root.classList.add("font-jakarta");
        else if (font === "sans") root.classList.add("font-sans-preset");
        else if (font === "serif") root.classList.add("font-serif-preset");
      } else {
        root.classList.remove("style-obsidian");
      }
    }
  }, [profile, profileStorageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
    localStorage.setItem("fithub-theme", theme);
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  // Guardar en estado local, perfil de usuario y EN LA BASE DE DATOS PÚBLICA DE SUPABASE
  const updateProfile = async (data: Partial<Profile>) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(updated));
    } catch (e) {}

    // Si se modificaron las fotos de las tiendas, guardar GLOBALMENTE en la base de datos para que todos los usuarios las vean
    if (data.storePhotos) {
      try {
        const payload = JSON.stringify(data.storePhotos);
        const { error: dbErr } = await supabase
          .from("visitas")
          .update({ notas: payload })
          .eq("id", CONFIG_RECORD_ID);

        if (dbErr) {
          console.error("Error guardando fotos globales en base de datos:", dbErr);
        }
      } catch (err) {
        console.error("Error updating global store photos in DB:", err);
      }
    }

    // Guardar en metadatos de la cuenta
    try {
      if (user) {
        await supabase.auth.updateUser({
          data: updated,
        });
      }
    } catch (err) {
      console.error("Error sincronizando perfil con Supabase:", err);
    }
  };

  const playBeep = () => {
    if (!profile.soundEnabled) return;
    try {
      const audio = new Audio('/sounds/chime.mp3');
      audio.volume = 0.6;
      audio.play().catch(e => console.log('Audio autoplay blocked', e));
    } catch (e) {
      console.log('Error playing sound', e);
    }
  };

  return (
    <ProfileContext.Provider value={{ theme, setTheme, profile, updateProfile, playBeep }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
