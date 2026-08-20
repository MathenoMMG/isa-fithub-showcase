import { createFileRoute } from "@tanstack/react-router";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingInteractivePreview } from "@/components/landing/LandingInteractivePreview";
import { LandingKpis } from "@/components/landing/LandingKpis";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useKeepAlive } from "@/lib/keep-alive";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sistema de Gestión de Inventarios y Punto de Venta" },
      { name: "description", content: "Plataforma para el control de inventarios, caducidades y jornadas en punto de venta." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  useKeepAlive();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingInteractivePreview />
        <LandingKpis />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  );
}
