import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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

const defaultProfile: Profile = {
  name: "Mercaimpulsadora",
  subtitle: "FitHub Ciudad Demo",
  avatar: "",
  soundEnabled: true,
  glowEnabled: true,
  stylePreset: "classic",
  fontPreset: "jakarta",
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("fithub-theme") as ThemeMode) || "system";
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("fithub-profile");
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem("fithub-profile", JSON.stringify(profile));
    
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
  }, [profile]);

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
      audio.volume = 0.6; // No tan fuerte
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
