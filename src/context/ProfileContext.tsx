import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

type ThemeMode = "light" | "dark" | "system";

interface Profile {
  name: string;
  subtitle: string;
  avatar: string; // Base64 image or URL
  soundEnabled: boolean;
  glowEnabled: boolean;
  stylePreset?: "classic" | "obsidian";
  fontPreset?: "jakarta" | "sans" | "serif";
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
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userEmail = user?.email || "guest";
  const profileStorageKey = `fithub-profile-${userEmail}`;

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("fithub-theme") as ThemeMode) || "system";
  });

  const [profile, setProfile] = useState<Profile>(() => {
    // 1. Prioridad: Metadatos de la cuenta en Supabase Cloud
    if (user?.user_metadata?.name) {
      return {
        ...defaultProfile,
        ...user.user_metadata,
      };
    }
    // 2. Caché local
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading profile cache:", e);
    }
    return defaultProfile;
  });

  // Sincronizar cuando el usuario autenticado cambia o llegan metadatos de Supabase
  useEffect(() => {
    if (!user) return;

    if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
      const cloudProfile: Profile = {
        name: user.user_metadata.name || defaultProfile.name,
        subtitle: user.user_metadata.subtitle || defaultProfile.subtitle,
        avatar: user.user_metadata.avatar || "",
        soundEnabled: user.user_metadata.soundEnabled ?? true,
        glowEnabled: user.user_metadata.glowEnabled ?? true,
        stylePreset: user.user_metadata.stylePreset || "classic",
        fontPreset: user.user_metadata.fontPreset || "jakarta",
      };
      setProfile(cloudProfile);
      localStorage.setItem(profileStorageKey, JSON.stringify(cloudProfile));
    } else {
      // Fallback a localStorage si aún no se han sincronizado metadatos en la nube
      try {
        const saved = localStorage.getItem(profileStorageKey);
        if (saved) {
          setProfile(JSON.parse(saved));
        }
      } catch (e) {}
    }
  }, [user, userEmail, profileStorageKey]);

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

  // Guardar tanto en estado local como en la nube de Supabase (user_metadata)
  const updateProfile = async (data: Partial<Profile>) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(updated));
    } catch (e) {}

    // Guardar en la nube de Supabase para que viaje con la cuenta a cualquier dispositivo
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
