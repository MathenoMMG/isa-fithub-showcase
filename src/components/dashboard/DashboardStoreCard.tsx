import { useStore } from "@/context/StoreContext";
import { useInventory } from "@/context/InventoryContext";
import { useProfile, DEFAULT_STORE_PHOTOS } from "@/context/ProfileContext";
import { Store, MapPin, Sparkles, ArrowRight, Layers, Clock, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { StoreFilter, StoreId } from "@/types/inventory";

const STORE_INFO: Record<StoreId, { address: string; hours: string; manager: string }> = {
  Norte: {
    address: "Av. Principal # 10-20, Norte",
    hours: "08:00 AM - 08:00 PM",
    manager: "Isabella",
  },
  Sur: {
    address: "Calle 30 # 15-45, Sur",
    hours: "08:00 AM - 07:00 PM",
    manager: "Isabella",
  },
  Centro: {
    address: "Carrera 8 # 40-12, Centro",
    hours: "09:00 AM - 09:00 PM",
    manager: "Isabella",
  },
};

export function DashboardStoreCard() {
  const { store, setStore } = useStore();
  const { filteredItems } = useInventory();
  const { profile } = useProfile();

  const isPremium = profile.stylePreset === "obsidian";
  const activeStorePhotos = {
    ...DEFAULT_STORE_PHOTOS,
    ...(profile.storePhotos || {}),
  };

  const isAll = store === "Ambas" || store === "Todas";
  const currentStoreId = isAll ? "Norte" : (store as StoreId);
  const currentPhoto = activeStorePhotos[currentStoreId] || DEFAULT_STORE_PHOTOS.Norte;
  const currentInfo = STORE_INFO[currentStoreId] || STORE_INFO.Norte;

  const totalProducts = (filteredItems || []).length;
  const totalStock = (filteredItems || []).reduce(
    (acc, item) => acc + (item.lotes?.reduce((sum, l) => sum + (l?.cantidad || 0), 0) || 0),
    0
  );

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 bg-slate-900 group">
      {/* Background Image Showcase */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden">
        <img
          src={currentPhoto}
          alt={isAll ? "Todas las tiendas" : store}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.75]"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-transparent to-black/60" />

        {/* Top Badges & Store Switcher */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {isAll ? "Red FitHub — 3 Sedes" : `Sede ${store}`}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 text-slate-200 border border-white/10 backdrop-blur-md">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              En Operación
            </span>
          </div>

          {/* Quick Store Pill Selector */}
          <div className="flex items-center bg-black/60 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
            {(["Ambas", "Norte", "Sur", "Centro"] as const).map((st) => {
              const isActive = (st === "Ambas" && isAll) || store === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStore(st as StoreFilter)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {st === "Ambas" ? "Todas" : st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Showcase Info */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 z-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 drop-shadow-sm">
              <Store className="h-5 w-5 text-emerald-400" />
              {isAll ? "Panel General FitHub" : `FitHub ${store}`}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-3 mt-1 font-medium drop-shadow-xs">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                {isAll ? "Norte · Sur · Centro" : currentInfo.address}
              </span>
              <span className="hidden md:flex items-center gap-1 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {currentInfo.hours}
              </span>
            </p>
          </div>

          {/* Mini KPI Highlights inside the Showcase */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">SKUs</span>
                <span className="text-sm font-bold text-white font-mono">{totalProducts}</span>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Stock Total</span>
                <span className="text-sm font-bold text-white font-mono">{totalStock}</span>
              </div>
            </div>

            <Link
              to="/ajustes"
              className="hidden lg:flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              title="Cambiar foto de la tienda en Ajustes"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
