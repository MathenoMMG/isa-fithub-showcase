import React from "react";
import { Store, Check, Upload, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StoreId } from "@/types/inventory";

interface StorePhotosSectionProps {
  selectedStoreToEdit: StoreId;
  activeStorePhotos: Record<StoreId, string>;
  storePhotoInputRef: React.RefObject<HTMLInputElement | null>;
  onSelectStore: (st: StoreId) => void;
  onStorePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetStorePhoto: (st: StoreId) => void;
}

export function StorePhotosSection({
  selectedStoreToEdit,
  activeStorePhotos,
  storePhotoInputRef,
  onSelectStore,
  onStorePhotoChange,
  onResetStorePhoto,
}: StorePhotosSectionProps) {
  const STORES: StoreId[] = ["Norte", "Sur", "Centro"];

  return (
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

        <div className="grid grid-cols-3 gap-2 mb-4">
          {STORES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onSelectStore(st)}
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
          ref={storePhotoInputRef as any}
          className="hidden"
          accept="image/*"
          onChange={onStorePhotoChange}
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
          onClick={() => onResetStorePhoto(selectedStoreToEdit)}
          className="h-10 text-xs text-slate-500 rounded-xl px-3 border-slate-200 dark:border-slate-800"
          title="Restablecer a imagen por defecto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
