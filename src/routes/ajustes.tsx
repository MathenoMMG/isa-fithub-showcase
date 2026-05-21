import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/context/StoreContext";
import { useInventory } from "@/context/InventoryContext";
import { useTimeLog } from "@/context/TimeLogContext";
import { useProfile } from "@/context/ProfileContext";
import { toast } from "sonner";
import type { StoreFilter } from "@/types/inventory";
import { RotateCcw, Monitor, Moon, Sun, Camera, RefreshCcw } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes · FitHub" },
      { name: "description", content: "Preferencias de la aplicación y perfil." },
    ],
  }),
  component: AjustesPage,
});

function AjustesPage() {
  const { store, setStore } = useStore();
  const { refreshData } = useInventory();
  const { refreshLogs } = useTimeLog();
  const { theme, setTheme, profile, updateProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([refreshData(), refreshLogs()]);
      toast.success("Sincronización completada con éxito");
    } catch (e) {
      toast.error("Error al sincronizar con Supabase");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = () => {
    if(confirm("¿Estás seguro de restablecer los ajustes locales? Esto borrará la foto de perfil, el nombre y el tema, volviendo a los valores por defecto.")) {
      localStorage.removeItem("fithub-profile");
      localStorage.removeItem("fithub-theme");
      window.location.reload();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es muy grande (máximo 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateProfile({ avatar: base64 });
      toast.success("Foto de perfil actualizada");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Ajustes</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Personaliza tu experiencia, perfil y aspecto visual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil */}
        <Card className="p-6 md:p-8 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 transition-colors">Tu Perfil</h3>
          
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div 
                className="h-24 w-24 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative group cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">
                    {profile.name ? profile.name.substring(0, 2).toUpperCase() : "FH"}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs h-8">
                Cambiar foto
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <Label className="dark:text-slate-300">Nombre completo</Label>
                <Input 
                  value={profile.name} 
                  onChange={(e) => updateProfile({ name: e.target.value })} 
                  className="h-11 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
                  placeholder="Ej. Isabella"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="dark:text-slate-300">Cargo / Subtítulo</Label>
                <Input 
                  value={profile.subtitle} 
                  onChange={(e) => updateProfile({ subtitle: e.target.value })} 
                  className="h-11 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
                  placeholder="Ej. FitHub Ciudad Demo"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Apariencia */}
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

          {/* Tienda Predeterminada */}
          <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Tienda predeterminada</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">Define qué tienda se muestra por defecto.</p>
            <Select value={store} onValueChange={(v) => setStore(v as StoreFilter)}>
              <SelectTrigger className="h-12 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-slate-200 text-base transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ambas" className="text-base py-3">Ambas tiendas</SelectItem>
                <SelectItem value="Sur" className="text-base py-3">Sur</SelectItem>
                <SelectItem value="Norte" className="text-base py-3">Norte</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Sync Card */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all">
          <div className="flex flex-col gap-4 h-full">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Forzar Sincronización</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Descarga los datos más recientes de inventario y horarios desde la base de datos global.
              </p>
            </div>
            <div className="mt-auto pt-2">
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 transition-colors"
              >
                <RefreshCcw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Sincronizando..." : "Sincronizar Datos"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Reset Card */}
        <Card className="p-6 rounded-2xl border-red-200 dark:border-red-900/30 bg-white dark:bg-slate-900 shadow-sm transition-all">
          <div className="flex flex-col gap-4 h-full">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Restablecer Ajustes Locales</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Borra únicamente tu foto de perfil, nombre y preferencias de tema de este dispositivo.
              </p>
            </div>
            <div className="mt-auto pt-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-11 border-red-300 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 rounded-xl gap-2 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Borrar perfil local
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
