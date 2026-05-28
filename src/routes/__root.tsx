import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ProfileProvider, useProfile } from "@/context/ProfileContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { StoreProvider } from "@/context/StoreContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { TimeLogProvider } from "@/context/TimeLogContext";
import { Toaster } from "@/components/ui/sonner";
import { VisitProvider } from "@/context/VisitContext";
import { supabase } from "@/lib/supabase";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">Intenta recargar la página.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

import { GlowBackground } from "@/components/layout/GlowBackground";
import { Gatekeeper } from "@/components/layout/Gatekeeper";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-[#1C4A2E] hover:bg-[#1C4A2E]/90 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl border border-emerald-700/20 dark:border-emerald-500/30 transition-all hover:scale-110 active:scale-95 duration-300 cursor-pointer animate-in fade-in zoom-in-75 duration-300"
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-5 w-5 stroke-[2.5]" />
    </button>
  );
}

function ConnectionLogger() {
  const { profile } = useProfile();

  useEffect(() => {
    let active = true;

    const logConnection = async () => {
      try {
        let ip = "Desconocida";
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          if (res.ok) {
            const data = await res.json();
            ip = data.ip || "Desconocida";
          }
        } catch (e) {
          console.warn("No se pudo obtener la IP pública del cliente:", e);
        }

        if (!active) return;

        await supabase.from("conexiones").insert({
          usuario: profile.name || "Mercaimpulsadora",
          ip: ip
        });
      } catch (err) {
        console.error("Error al registrar conexión:", err);
      }
    };

    logConnection();

    return () => {
      active = false;
    };
  }, [profile.name]);

  return null;
}

function RootComponent() {
  return (
    <Gatekeeper>
      <ProfileProvider>
        <ConnectionLogger />
        <StoreProvider>
          <InventoryProvider>
            <TimeLogProvider>
              <VisitProvider>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 transition-colors relative">
                    <GlowBackground />
                    <AppSidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                      <TopBar />
                      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto z-10">
                        <Outlet />
                      </main>
                    </div>
                  </div>
                  <Toaster richColors position="top-right" />
                  <ScrollToTopButton />
                </SidebarProvider>
              </VisitProvider>
            </TimeLogProvider>
          </InventoryProvider>
        </StoreProvider>
      </ProfileProvider>
    </Gatekeeper>
  );
}
