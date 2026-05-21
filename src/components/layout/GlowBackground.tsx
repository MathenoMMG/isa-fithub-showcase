import { useProfile } from "@/context/ProfileContext";

export function GlowBackground() {
  const { profile } = useProfile();
  
  if (profile.glowEnabled === false) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Esfera Esmeralda Superior Izquierda */}
      <div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80"
      />
      
      {/* Esfera Azul Inferior Derecha */}
      <div 
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-80"
      />
      
      {/* Capa de ruido sutil opcional (si quisieramos textura) */}
      <div className="absolute inset-0 bg-noise opacity-[0.015] dark:opacity-[0.03]" />
    </div>
  );
}
