import { useProfile } from "@/context/ProfileContext";

export function GlowBackground() {
  const { profile } = useProfile();
  
  if (profile.glowEnabled === false) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Esfera Esmeralda Superior Izquierda */}
      <div 
        className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-emerald-500/20 dark:bg-emerald-500/25 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-100"
      />
      
      {/* Esfera Azul Inferior Derecha */}
      <div 
        className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-blue-500/20 dark:bg-blue-500/25 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-100"
      />
      
      {/* Capa de ruido sutil opcional (si quisieramos textura) */}
      <div className="absolute inset-0 bg-noise opacity-[0.015] dark:opacity-[0.03]" />
    </div>
  );
}
