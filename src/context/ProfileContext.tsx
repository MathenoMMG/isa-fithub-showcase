import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

type ThemeMode = "light" | "dark" | "system";

interface Profile {
  name: string;
  subtitle: string;
  avatar: string; // Base64 image
  soundEnabled: boolean;
  glowEnabled: boolean;
  stylePreset?: "classic" | "obsidian";
  fontPreset?: "jakarta" | "sans" | "serif";
}

interface ProfileContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  profile: Profile;
  updateProfile: (data: Partial<Profile>) => void;
  playBeep: () => void;
}

const getDefaultProfileForEmail = (email?: string | null): Profile => {
  const normalized = email?.trim().toLowerCase() || "";
  
  if (normalized === "owner@example.com") {
    return {
      name: "Isabella",
      subtitle: "Mercaimpulsadora FitHub",
      avatar: "",
      soundEnabled: true,
      glowEnabled: true,
      stylePreset: "classic",
      fontPreset: "jakarta",
    };
  }

  if (normalized === "mathewpro123@gmail.com") {
    return {
      name: "Mathew",
      subtitle: "Administrador de Sistema",
      avatar: "",
      soundEnabled: true,
      glowEnabled: true,
      stylePreset: "obsidian",
      fontPreset: "jakarta",
    };
  }

  return {
    name: "Operador FitHub",
    subtitle: "Punto de Venta",
    avatar: "",
    soundEnabled: true,
    glowEnabled: true,
    stylePreset: "classic",
    fontPreset: "jakarta",
  };
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userEmail = user?.email || "default";
  const profileStorageKey = `fithub-profile-${userEmail}`;

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("fithub-theme") as ThemeMode) || "system";
  });

  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) return JSON.parse(saved);
      // Fallback a clave legacy o default
      const legacy = localStorage.getItem("fithub-profile");
      if (legacy && userEmail === "owner@example.com") {
        return JSON.parse(legacy);
      }
    } catch (e) {
      console.error("Error reading profile from localStorage:", e);
    }
    return getDefaultProfileForEmail(user?.email);
  });

  // Rehidratar perfil cuando cambia la sesión de usuario
  useEffect(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) {
        setProfile(JSON.parse(saved));
        return;
      }
      const legacy = localStorage.getItem("fithub-profile");
      if (legacy && userEmail === "owner@example.com") {
        const parsed = JSON.parse(legacy);
        setProfile(parsed);
        localStorage.setItem(profileStorageKey, JSON.stringify(parsed));
        return;
      }
    } catch (e) {
      console.error("Error updating profile for active user:", e);
    }
    setProfile(getDefaultProfileForEmail(user?.email));
  }, [userEmail, profileStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    } catch (e) {
      console.error("Error saving profile to storage:", e);
    }
    
    // Sincronizar clase global de estilo preferencial en el elemento html raíz
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      
      // Limpiar clases de tipografía previas
      root.classList.remove("font-jakarta", "font-sans-preset", "font-serif-preset");
      
      if (profile.stylePreset === "obsidian") {
        root.classList.add("style-obsidian");
        
        const font = profile.fontPreset || "jakarta";
        if (font === "jakarta") {
          root.classList.add("font-jakarta");
        } else if (font === "sans") {
          root.classList.add("font-sans-preset");
        } else if (font === "serif") {
          root.classList.add("font-serif-preset");
        }
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

  const updateProfile = (data: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...data }));
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
