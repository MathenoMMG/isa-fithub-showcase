import React from "react";
import { Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSectionProps {
  email?: string;
  name: string;
  subtitle: string;
  avatar?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateProfile: (data: { name?: string; subtitle?: string }) => void;
}

export function ProfileSection({
  email,
  name,
  subtitle,
  avatar,
  fileInputRef,
  onFileChange,
  onUpdateProfile,
}: ProfileSectionProps) {
  return (
    <Card className="p-6 md:p-8 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors">Tu Perfil</h3>
        {email && (
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            {email}
          </span>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div 
            className="h-24 w-24 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative group cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">
                {name ? name.substring(0, 2).toUpperCase() : "FH"}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef as any} 
            className="hidden" 
            accept="image/*" 
            onChange={onFileChange}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs h-8">
            Cambiar foto
          </Button>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <Label className="dark:text-slate-300">Nombre completo</Label>
            <Input 
              value={name} 
              onChange={(e) => onUpdateProfile({ name: e.target.value })} 
              className="h-11 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
              placeholder="Ej. Isabella"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="dark:text-slate-300">Cargo / Subtítulo</Label>
            <Input 
              value={subtitle} 
              onChange={(e) => onUpdateProfile({ subtitle: e.target.value })} 
              className="h-11 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
              placeholder="Ej. FitHub Ciudad Demo"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
