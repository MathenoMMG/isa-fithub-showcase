import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/context/StoreContext";
import { useInventory } from "@/context/InventoryContext";
import { useTimeLog } from "@/context/TimeLogContext";
import { useVisitas } from "@/context/VisitContext";
import { useProfile, DEFAULT_STORE_PHOTOS } from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { StoreId } from "@/types/inventory";
import { useRef, useState } from "react";
import { exportGlobalBackup } from "@/services/backup.service";

import { ProfileSection } from "@/components/settings/ProfileSection";
import { StorePhotosSection } from "@/components/settings/StorePhotosSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { SystemMaintenanceGrid } from "@/components/settings/SystemMaintenanceGrid";

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
  const { refreshData, filteredItems, mermas, traspasos } = useInventory();
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
    if (confirm("¿Estás seguro de restablecer los ajustes locales? Esto borrará la foto de perfil, el nombre y el tema, volviendo a los valores por defecto.")) {
      localStorage.removeItem("fithub-profile");
      localStorage.removeItem("fithub-theme");
      window.location.reload();
    }
  };

  const handleHardReset = () => {
    if (confirm("⚠ ADVERTENCIA ⚠\n\n¿Estás completamente seguro de querer limpiar toda la caché de la tablet? Esto borrará TODOS los datos locales temporales, preferencias y cerrará sesiones.\n\nSolo usa esta opción si la aplicación está fallando.")) {
      if (confirm("Por favor, confirma una vez más. ¿Deseas limpiar la caché y recargar?")) {
        localStorage.clear();
        sessionStorage.clear();
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
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
      exportGlobalBackup({
        inventory: filteredItems,
        logs,
        visitas,
        mermas,
        traspasos,
      });
      toast.success("Backup exportado correctamente (5 hojas)");
    } catch (err) {
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
        <ProfileSection
          email={user?.email}
          name={profile.name}
          subtitle={profile.subtitle}
          avatar={profile.avatar}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onUpdateProfile={updateProfile}
        />

        <StorePhotosSection
          selectedStoreToEdit={selectedStoreToEdit}
          activeStorePhotos={activeStorePhotos}
          storePhotoInputRef={storePhotoInputRef}
          onSelectStore={setSelectedStoreToEdit}
          onStorePhotoChange={handleStorePhotoChange}
          onResetStorePhoto={handleResetStorePhoto}
        />

        <AppearanceSection
          theme={theme}
          setTheme={setTheme}
          stylePreset={profile.stylePreset}
          fontPreset={profile.fontPreset}
          store={store}
          setStore={setStore}
          soundEnabled={profile.soundEnabled}
          glowEnabled={profile.glowEnabled}
          onUpdateProfile={updateProfile}
        />
      </div>

      <SystemMaintenanceGrid
        isSyncing={isSyncing}
        onSync={handleSync}
        onResetLocal={handleReset}
        onExportBackup={handleExportBackup}
        onHardReset={handleHardReset}
      />
    </div>
  );
}
