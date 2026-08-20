import { createFileRoute } from "@tanstack/react-router";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingInteractivePreview } from "@/components/landing/LandingInteractivePreview";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitHub Manager — Gestión Inteligente de Inventarios" },
      { name: "description", content: "Plataforma operativa para control de inventarios, caducidades y jornadas en Ciudad Demo." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors">
      <LandingNavbar />
      <main className="flex-1">
        <LandingHero />
        <LandingInteractivePreview />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  );
}
