import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/context/StoreContext";
import { useInventory } from "@/context/InventoryContext";
import { useTimeLog } from "@/context/TimeLogContext";
import { useVisitas } from "@/context/VisitContext";
import { useProfile, DEFAULT_STORE_PHOTOS } from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { StoreFilter, StoreId } from "@/types/inventory";
import { RotateCcw, Monitor, Moon, Sun, Camera, RefreshCcw, Bell, BellOff, Database, AlertTriangle, Download, Sparkles, Store, Image as ImageIcon, Upload, Check } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Switch } from "@/components/ui/switch";

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
  const { refreshData, filteredItems } = useInventory();
  const { refreshLogs, logs } = useTimeLog();
  const { visitas } = useVisitas();
  const { theme, setTheme, profile, updateProfile } = useProfile();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storePhotoInputRef = useRef<HTMLInputElement>(null);
  const [selectedStoreToEdit, setSelectedStoreToEdit] = useState<StoreId>("Norte");
  
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

  const handleHardReset = () => {
    if(confirm("⚠ ADVERTENCIA ⚠\n\n¿Estás completamente seguro de querer limpiar toda la caché de la tablet? Esto borrará TODOS los datos locales temporales, preferencias y cerrará sesiones.\n\nSolo usa esta opción si la aplicación está fallando.")) {
      if(confirm("Por favor, confirma una vez más. ¿Deseas limpiar la caché y recargar?")) {
        localStorage.clear();
        sessionStorage.clear();
        // Intentar limpiar service workers si existen
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
              registration.unregister();
            }
          });
        }
        toast.success("Limpiando caché y reiniciando...");
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const handleExportBackup = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Inventario
      const invData = filteredItems.map(p => ({
        ID: p.id,
        SKU: p.articulo,
        Sicol: p.sicol,
        Nombre: p.nombre,
        Categoría: p.categoria || "Otros",
        Proveedor: p.proveedor_nombre,
        Stock_Total: p.lotes?.reduce((acc, l) => acc + (l.cantidad || 0), 0) || 0,
        Lotes_Activos: p.lotes?.filter(l => l.cantidad > 0).length || 0,
        Tienda: p.tienda_nombre,
      }));
      const wsInv = XLSX.utils.json_to_sheet(invData);
      XLSX.utils.book_append_sheet(wb, wsInv, "Inventario");

      // Hoja 2: Horarios (Logs)
      const logsData = logs.map(l => ({
        ID: l.id,
        Tienda_ID: l.tienda_id,
        Tipo: l.tipo === 'entrada' ? 'Entrada' : 'Salida',
        Fecha_Hora: l.created_at,
      }));
      const wsLogs = XLSX.utils.json_to_sheet(logsData);
      XLSX.utils.book_append_sheet(wb, wsLogs, "Horarios");

      // Hoja 3: Visitas
      const visitasData = visitas.map(v => ({
        ID: v.id,
        Tienda_ID: v.tienda_id,
        Fecha: v.fecha,
        Notas: v.notas || "—",
      }));
      const wsVisitas = XLSX.utils.json_to_sheet(visitasData);
      XLSX.utils.book_append_sheet(wb, wsVisitas, "Visitas");

      // Hoja 4: Mermas
      const mermasData = (mermas || []).map(m => ({
        ID: m.id,
        Producto_ID: m.producto_id,
        Tienda_ID: m.tienda_id,
        Cantidad: m.cantidad,
        Motivo: m.motivo,
        Notas: m.notas || "—",
        Usuario: m.usuario || "—",
        Fecha: m.created_at,
      }));
      const wsMermas = XLSX.utils.json_to_sheet(mermasData);
      XLSX.utils.book_append_sheet(wb, wsMermas, "Mermas");

      // Guardar
      const today = new Date().toISOString().slice(0,10);
      XLSX.writeFile(wb, `Backup_Global_FitHub_${today}.xlsx`);
      toast.success("Backup exportado correctamente");
    } catch(err) {
      toast.error("Error exportando backup");
      console.error(err);
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

  const handleStorePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("La imagen es muy grande (máximo 3MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const currentPhotos = profile.storePhotos || DEFAULT_STORE_PHOTOS;
      updateProfile({
        storePhotos: {
          ...currentPhotos,
          [selectedStoreToEdit]: base64,
        },
      });
      toast.success(`Foto de ${selectedStoreToEdit} actualizada`);
    };
    reader.readAsDataURL(file);
  };

  const handleResetStorePhoto = (storeName: StoreId) => {
    const currentPhotos = profile.storePhotos || DEFAULT_STORE_PHOTOS;
    updateProfile({
      storePhotos: {
        ...currentPhotos,
        [storeName]: DEFAULT_STORE_PHOTOS[storeName],
      },
    });
    toast.success(`Foto de ${storeName} restablecida a la predeterminada`);
  };

  const activeStorePhotos = {
    ...DEFAULT_STORE_PHOTOS,
    ...(profile.storePhotos || {}),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 transition-colors">Ajustes</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Personaliza tu experiencia, perfil, sedes y aspecto visual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil */}
        <Card className="p-6 md:p-8 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors">Tu Perfil</h3>
            {user?.email && (
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                {user.email}
              </span>
            )}
          </div>
          
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

        {/* Fotos de Tiendas */}
        <Card className="p-6 md:p-8 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Store className="h-5 w-5 text-emerald-500" />
                Fotos de las Tiendas
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                3 Sedes
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Personaliza la foto de portada para cada tienda. Se mostrará en el Card Showcase del Dashboard.
            </p>

            {/* Pestañas de selección de tienda a editar */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(["Norte", "Sur", "Centro"] as StoreId[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStoreToEdit(st)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                    selectedStoreToEdit === st
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Preview de la foto de la tienda activa */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-36 bg-slate-100 dark:bg-slate-950 group">
              <img
                src={activeStorePhotos[selectedStoreToEdit]}
                alt={selectedStoreToEdit}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Sede {selectedStoreToEdit}
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={storePhotoInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleStorePhotoChange}
            />
          </div>

          <div className="flex items-center gap-2 mt-4 pt-2">
            <Button
              type="button"
              onClick={() => storePhotoInputRef.current?.click()}
              className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5 font-medium shadow-sm transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Subir Foto {selectedStoreToEdit}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleResetStorePhoto(selectedStoreToEdit)}
              className="h-10 text-xs text-slate-500 rounded-xl px-3 border-slate-200 dark:border-slate-800"
              title="Restablecer a imagen por defecto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
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

          {/* Estilo Visual */}
          <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Estilos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">Elige tu preset estético preferido. Premium transforma tipografías, formas y colores.</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => updateProfile({ stylePreset: "classic" })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${profile.stylePreset === "classic" || !profile.stylePreset ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
              >
                <div className="h-6 w-6 mb-2 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">CLA</div>
                <span className="text-sm">Classic</span>
              </button>
              
              <button 
                onClick={() => updateProfile({ stylePreset: "obsidian" })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${profile.stylePreset === "obsidian" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
              >
                <Sparkles className="h-6 w-6 mb-2 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                <span className="text-sm">Premium</span>
              </button>
            </div>
          </Card>

          {/* Tipografía Premium - Solo visible en modo Premium (obsidian) */}
          {profile.stylePreset === "obsidian" && (
            <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 transition-colors">Tipografía Premium</h3>
              <p className="text-sm text-slate-505 dark:text-slate-400 mb-4 transition-colors">Personaliza la fuente de letras en el modo Premium.</p>
              
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => updateProfile({ fontPreset: "jakarta" })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${profile.fontPreset === "jakarta" || !profile.fontPreset ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
                >
                  <span className="text-xs uppercase">Moderna</span>
                  <span className="text-[10px] opacity-60 font-mono mt-0.5">Jakarta</span>
                </button>
                
                <button 
                  onClick={() => updateProfile({ fontPreset: "sans" })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${profile.fontPreset === "sans" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
                >
                  <span className="text-xs uppercase">Clásica</span>
                  <span className="text-[10px] opacity-60 font-mono mt-0.5">DM Sans</span>
                </button>
                
                <button 
                  onClick={() => updateProfile({ fontPreset: "serif" })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${profile.fontPreset === "serif" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"}`}
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
                  {profile.soundEnabled ? <Bell className="h-4 w-4 text-emerald-500" /> : <BellOff className="h-4 w-4 text-slate-400" />}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reproducir un tono al registrar marcaciones.</p>
              </div>
              <Switch 
                checked={profile.soundEnabled} 
                onCheckedChange={(checked) => {
                  updateProfile({ soundEnabled: checked });
                  if (checked) {
                    try {
                      const audio = new Audio('/sounds/chime.mp3');
                      audio.volume = 0.6;
                      audio.play().catch(e => {});
                    } catch(e) {}
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
                  <Sparkles className={`h-4 w-4 ${profile.glowEnabled ? "text-emerald-500" : "text-slate-400"}`} />
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Luces de fondo para un diseño inmersivo.</p>
              </div>
              <Switch 
                checked={profile.glowEnabled ?? true} 
                onCheckedChange={(checked) => updateProfile({ glowEnabled: checked })} 
              />
            </div>
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

        {/* Backup Global */}
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all">
          <div className="flex flex-col gap-4 h-full">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Exportar Backup Global</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Descarga un Excel con todo el inventario, turnos e historial de visitas guardado.
              </p>
            </div>
            <div className="mt-auto pt-2">
              <Button
                onClick={handleExportBackup}
                variant="outline"
                className="w-full h-11 border-emerald-300 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-800 dark:hover:text-emerald-300 rounded-xl gap-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                Descargar Backup (.xlsx)
              </Button>
            </div>
          </div>
        </Card>

        {/* Hard Reset Card */}
        <Card className="p-6 rounded-2xl border-red-200 dark:border-red-900/30 bg-white dark:bg-slate-900 shadow-sm transition-all">
          <div className="flex flex-col gap-4 h-full">
            <div>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Limpieza Profunda
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Botón de emergencia. Borra toda la caché, forzando a la app a descargar todo desde cero.
              </p>
            </div>
            <div className="mt-auto pt-2">
              <Button
                onClick={handleHardReset}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 transition-colors font-bold"
              >
                <Database className="h-4 w-4" />
                Limpiar Toda la Caché
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
