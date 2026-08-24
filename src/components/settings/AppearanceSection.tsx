import { Sun, Moon, Monitor, Sparkles, Bell, BellOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StoreFilter } from "@/types/inventory";

interface AppearanceSectionProps {
  theme: string;
  setTheme: (theme: "light" | "dark" | "system") => void;
  stylePreset?: string;
  fontPreset?: string;
  store: StoreFilter;
  setStore: (s: StoreFilter) => void;
  soundEnabled?: boolean;
  glowEnabled?: boolean;
  onUpdateProfile: (data: { stylePreset?: "classic" | "obsidian"; fontPreset?: "jakarta" | "sans" | "serif"; soundEnabled?: boolean; glowEnabled?: boolean }) => void;
}

export function AppearanceSection({
  theme,
  setTheme,
  stylePreset,
  fontPreset,
  store,
  setStore,
  soundEnabled,
  glowEnabled,
  onUpdateProfile,
}: AppearanceSectionProps) {
  return (
    <div className="space-y-6">
      {/* Tema de Color */}
      <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Apariencia</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">Elige el tema de colores de la aplicación.</p>
        
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
          >
            <Sun className="h-6 w-6 mb-2" />
            <span className="text-sm font-semibold">Claro</span>
          </button>
          
          <button 
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
          >
            <Moon className="h-6 w-6 mb-2" />
            <span className="text-sm font-semibold">Oscuro</span>
          </button>
          
          <button 
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "system" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
          >
            <Monitor className="h-6 w-6 mb-2" />
            <span className="text-sm font-semibold">Sistema</span>
          </button>
        </div>
      </Card>

      {/* Preset Estético */}
      <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Estilos</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">Elige tu preset estético preferido. Premium transforma tipografías, formas y colores.</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onUpdateProfile({ stylePreset: "classic" })}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${stylePreset === "classic" || !stylePreset ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
          >
            <div className="h-6 w-6 mb-2 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">CLA</div>
            <span className="text-sm">Classic</span>
          </button>
          
          <button 
            onClick={() => onUpdateProfile({ stylePreset: "obsidian" })}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${stylePreset === "obsidian" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
          >
            <Sparkles className="h-6 w-6 mb-2 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span className="text-sm">Premium</span>
          </button>
        </div>
      </Card>

      {/* Tipografía Premium */}
      {stylePreset === "obsidian" && (
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Tipografía Premium</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">Personaliza la fuente de letras en el modo Premium.</p>
          
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onUpdateProfile({ fontPreset: "jakarta" })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${fontPreset === "jakarta" || !fontPreset ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
            >
              <span className="text-xs uppercase">Moderna</span>
              <span className="text-[10px] opacity-60 font-mono mt-0.5">Jakarta</span>
            </button>
            
            <button 
              onClick={() => onUpdateProfile({ fontPreset: "sans" })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${fontPreset === "sans" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
            >
              <span className="text-xs uppercase">Clásica</span>
              <span className="text-[10px] opacity-60 font-mono mt-0.5">DM Sans</span>
            </button>
            
            <button 
              onClick={() => onUpdateProfile({ fontPreset: "serif" })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${fontPreset === "serif" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
            >
              <span className="text-xs uppercase">Elegante</span>
              <span className="text-[10px] opacity-60 font-mono mt-0.5">Serif</span>
            </button>
          </div>
        </Card>
      )}

      {/* Tienda Predeterminada */}
      <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Tienda predeterminada</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">Define qué tienda se muestra por defecto.</p>
        <Select value={store} onValueChange={(v) => setStore(v as StoreFilter)}>
          <SelectTrigger className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-slate-200 text-base transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ambas" className="text-base py-3">Todas las tiendas</SelectItem>
            <SelectItem value="Norte" className="text-base py-3">Norte</SelectItem>
            <SelectItem value="Sur" className="text-base py-3">Sur</SelectItem>
            <SelectItem value="Centro" className="text-base py-3">Centro</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Sonidos */}
      <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Alertas de Sonido
              {soundEnabled ? <Bell className="h-4 w-4 text-emerald-500" /> : <BellOff className="h-4 w-4 text-slate-400" />}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reproducir un tono al registrar marcaciones.</p>
          </div>
          <Switch 
            checked={soundEnabled} 
            onCheckedChange={(checked) => {
              onUpdateProfile({ soundEnabled: checked });
              if (checked) {
                try {
                  const audio = new Audio('/sounds/chime.mp3');
                  audio.volume = 0.6;
                  audio.play().catch(() => {});
                } catch {}
              }
            }} 
          />
        </div>
      </Card>

      {/* Glow Effect */}
      <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Efecto Glow (Fondo)
              <Sparkles className={`h-4 w-4 ${glowEnabled ? "text-emerald-500" : "text-slate-400"}`} />
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Luces de fondo para un diseño inmersivo.</p>
          </div>
          <Switch 
            checked={glowEnabled ?? true} 
            onCheckedChange={(checked) => onUpdateProfile({ glowEnabled: checked })} 
          />
        </div>
      </Card>
    </div>
  );
}
